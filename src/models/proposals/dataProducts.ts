import { z } from 'zod';
import {
  AA2_LOW_LONGEST_BASELINE_M,
  AA2_LOW_STATION_DIAMETER_M,
  BIT_DEPTH_DEFAULT,
  CHANNELS_OUT_DEFAULT,
  CHANNELS_OUT_MAX,
  CHANNELS_OUT_MAX_COMBINED,
  CHANNELS_OUT_MIN_CONTINUUM,
  CHANNELS_OUT_MIN_SPECTRAL,
  DETECTED_FILTER_BANK_VALUE,
  FLOW_THROUGH_VALUE,
  IMAGE_SIZE_DEFAULT,
  PIXEL_SIZE_DEFAULT,
  PST_DEDICATED_FILTERBANK_BIT_DEPTH_VALUES,
  PST_FLOW_THROUGH_BIT_DEPTH_VALUES,
  ROBUST_DEFAULT,
  SET_CONTINUUM_SUBSTRACTION_DEFAULT,
  SPEED_OF_LIGHT,
  TAPER_DEFAULT
} from '@/utils/constants';
import { generateDataProductId } from '@/utils/helpers';
import phtTranslations from '../../../public/locales/en/pht.json';
import {
  ImageWeighting,
  Polarisation,
  type DataProductSDP,
  type ScriptParameters
} from '@/generated/models';

export const DATA_PRODUCT_KIND = {
  CONTINUUM_IMAGE: 'continuumImage',
  CONTINUUM_VISIBILITIES: 'continuumVisibilities',
  SPECTRAL_IMAGE: 'spectralImage',
  CONTINUUM_SPECTRAL_IMAGE: 'continuumSpectralImage',
  PST_FLOW_THROUGH: 'pstFlowThrough',
  PST_DETECTED_FILTERBANK: 'pstDetectedFilterbank',
  PST_TIMING: 'pstTiming'
} as const;

export type DataProductKind = (typeof DATA_PRODUCT_KIND)[keyof typeof DATA_PRODUCT_KIND];

export const ANGLE_UNIT = {
  DEG: 'deg',
  ARCMIN: 'arcmin',
  ARCSEC: 'arcsec'
} as const;

// Fills in a translation's {{placeholders}}. The schema messages don't go through i18next.
const fill = (message: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{{${key}}}`, String(value)),
    message
  );

// The unit is a required dropdown. It is null in the form when none is chosen, such as when the
// backend sent a unit the editor doesn't know, and is only valid once one is chosen.
const angleSchema = (valueMessage: string, unitMessage: string) =>
  z.object({
    value: z.number({ error: valueMessage }).gt(0, valueMessage),
    unit: z
      .enum(ANGLE_UNIT)
      .nullable()
      .pipe(z.enum(ANGLE_UNIT, { error: unitMessage }))
  });

const ROBUST_RANGE = { min: -2, max: 2 };
const DISPERSION_MEASURE_MIN = 0;

/**
 * Fields the backend stores as a whole number of steps (an averaging factor, or a multiple of the
 * PST fundamental resolution or interval), which the form holds as the physical value the user
 * sees: the factor times the step.
 */
export const STEPPED_FIELD = {
  TIME_AVERAGING_S: { step: 0.84934656, decimalPlaces: 3, minSteps: 1, maxSteps: 12 },
  FREQUENCY_AVERAGING_KHZ: { step: 781.25 / 144, decimalPlaces: 2, minSteps: 1, maxSteps: 12 },
  OUTPUT_FREQUENCY_RESOLUTION_KHZ: { step: 781.25 / 216, decimalPlaces: 2, minSteps: 1 },
  OUTPUT_SAMPLING_INTERVAL_MS: { step: 0.20736, decimalPlaces: 3, minSteps: 1 }
} as const;

type SteppedField = (typeof STEPPED_FIELD)[keyof typeof STEPPED_FIELD] & { maxSteps?: number };

/**
 * A whole number of steps, in range. The field shows the value rounded, so a value is on a step
 * when it is within half the last shown decimal place of one: what the user types as shown is
 * accepted.
 */
const steppedSchema = (
  { step, decimalPlaces, minSteps, maxSteps }: SteppedField,
  rangeMessage: string,
  stepMessage: string
) => {
  const tolerance = 0.5 * 10 ** -decimalPlaces;
  const number = z.number({ error: rangeMessage }).min(minSteps * step - tolerance, rangeMessage);
  return (maxSteps ? number.max(maxSteps * step + tolerance, rangeMessage) : number).refine(
    (value) => Math.abs(value - Math.round(value / step) * step) <= tolerance,
    stepMessage
  );
};

/** The number of steps a stepped field's value is, as the backend stores it. */
export const steppedToPdm = (value: number, { step }: SteppedField) => Math.round(value / step);

/** The physical value of a number of steps from the backend. */
export const steppedFromPdm = (steps: number, { step }: SteppedField) => steps * step;

const averagingSchema = (field: SteppedField, messages: typeof phtTranslations.timeAveraging) =>
  steppedSchema(
    field,
    fill(messages.error.range, {
      min: (field.minSteps * field.step).toFixed(field.decimalPlaces),
      max: ((field.maxSteps ?? field.minSteps) * field.step).toFixed(field.decimalPlaces)
    }),
    messages.error.step
  );

const pstSteppedSchema = (
  field: SteppedField,
  messages: typeof phtTranslations.outputFrequencyResolution
) => {
  const multipleMessage = fill(messages.error.multiple, {
    value: field.step.toFixed(field.decimalPlaces)
  });
  return steppedSchema(field, multipleMessage, multipleMessage);
};

const polarisationsSchema = z
  .array(z.enum(Polarisation))
  .min(1, phtTranslations.polarisations.error);

const channelsOutSchema = (min: number, max: number) => {
  const message = fill(phtTranslations.channelsOut.error, { min, max });
  return z.number({ error: message }).int(message).min(min, message).max(max, message);
};

const bitDepthSchema = (values: number[]) =>
  z.number().refine((value) => values.includes(value), phtTranslations.bitDepth.error);

const dataProductBaseSchema = z.object({
  id: z.string(),
  observationId: z.string()
});

const imageDataProductSchema = dataProductBaseSchema.extend({
  imageSize: angleSchema(phtTranslations.imageSize.error, phtTranslations.imageSize.unitError),
  pixelSize: angleSchema(phtTranslations.pixelSize.error, phtTranslations.pixelSize.unitError),
  weighting: z.enum(ImageWeighting, { error: phtTranslations.imageWeighting.error }),
  robust: z
    .number({ error: phtTranslations.robust.error })
    .min(ROBUST_RANGE.min, phtTranslations.robust.error)
    .max(ROBUST_RANGE.max, phtTranslations.robust.error),
  taper: z.number({ error: phtTranslations.taper.error }).min(0, phtTranslations.taper.error),
  polarisations: polarisationsSchema,
  channelsOut: z.number().int()
});

type ImageDataProductValues = z.output<typeof imageDataProductSchema>;

export function getDataProductSchema() {
  return z.discriminatedUnion('kind', [
    imageDataProductSchema.extend({
      kind: z.literal(DATA_PRODUCT_KIND.CONTINUUM_IMAGE),
      channelsOut: channelsOutSchema(CHANNELS_OUT_MIN_CONTINUUM, CHANNELS_OUT_MAX)
    }),
    imageDataProductSchema.extend({
      kind: z.literal(DATA_PRODUCT_KIND.SPECTRAL_IMAGE),
      channelsOut: channelsOutSchema(CHANNELS_OUT_MIN_SPECTRAL, CHANNELS_OUT_MAX),
      continuumSubtraction: z.boolean()
    }),
    imageDataProductSchema.extend({
      kind: z.literal(DATA_PRODUCT_KIND.CONTINUUM_SPECTRAL_IMAGE),
      channelsOut: channelsOutSchema(CHANNELS_OUT_MIN_SPECTRAL, CHANNELS_OUT_MAX_COMBINED)
    }),
    dataProductBaseSchema.extend({
      kind: z.literal(DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES),
      timeAveragingS: averagingSchema(
        STEPPED_FIELD.TIME_AVERAGING_S,
        phtTranslations.timeAveraging
      ),
      frequencyAveragingKhz: averagingSchema(
        STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ,
        phtTranslations.frequencyAveraging
      )
    }),
    dataProductBaseSchema.extend({
      kind: z.literal(DATA_PRODUCT_KIND.PST_FLOW_THROUGH),
      polarisations: polarisationsSchema,
      bitDepth: bitDepthSchema(PST_FLOW_THROUGH_BIT_DEPTH_VALUES)
    }),
    dataProductBaseSchema.extend({
      kind: z.literal(DATA_PRODUCT_KIND.PST_DETECTED_FILTERBANK),
      polarisations: polarisationsSchema,
      bitDepth: bitDepthSchema(PST_DEDICATED_FILTERBANK_BIT_DEPTH_VALUES),
      outputFrequencyResolutionKhz: pstSteppedSchema(
        STEPPED_FIELD.OUTPUT_FREQUENCY_RESOLUTION_KHZ,
        phtTranslations.outputFrequencyResolution
      ),
      outputSamplingIntervalMs: pstSteppedSchema(
        STEPPED_FIELD.OUTPUT_SAMPLING_INTERVAL_MS,
        phtTranslations.outputSamplingInterval
      ),
      dispersionMeasure: z
        .number({ error: phtTranslations.rotationMeasure.required })
        .min(
          DISPERSION_MEASURE_MIN,
          fill(phtTranslations.dispersionMeasure.minimum.error, { min: DISPERSION_MEASURE_MIN })
        ),
      rotationMeasure: z.number({ error: phtTranslations.rotationMeasure.required })
    }),
    dataProductBaseSchema.extend({
      kind: z.literal(DATA_PRODUCT_KIND.PST_TIMING)
    })
  ]);
}

export function getDataProductsSchema() {
  return z.array(getDataProductSchema());
}

// A data product as the form holds it, which can be invalid
export type DataProductInput = z.input<ReturnType<typeof getDataProductSchema>>;

// A valid data product, as the schema outputs it
export type DataProductValues = z.output<ReturnType<typeof getDataProductSchema>>;

/*********************************************************** New data products *********************************************************/

const NEW_IMAGE_FIELDS = {
  imageSize: { value: IMAGE_SIZE_DEFAULT, unit: ANGLE_UNIT.DEG },
  pixelSize: { value: PIXEL_SIZE_DEFAULT, unit: ANGLE_UNIT.ARCSEC },
  weighting: ImageWeighting.Briggs,
  robust: ROBUST_DEFAULT,
  taper: TAPER_DEFAULT,
  polarisations: [Polarisation.I],
  channelsOut: CHANNELS_OUT_DEFAULT
};

/** A new data product of the kind for the observation, with the default values for the kind. */
export const newDataProduct = (kind: DataProductKind, observationId: string): DataProductInput => {
  const ids = { id: generateDataProductId(), observationId };
  switch (kind) {
    case DATA_PRODUCT_KIND.CONTINUUM_IMAGE:
      return { ...ids, kind, ...NEW_IMAGE_FIELDS };
    case DATA_PRODUCT_KIND.SPECTRAL_IMAGE:
      return {
        ...ids,
        kind,
        ...NEW_IMAGE_FIELDS,
        continuumSubtraction: SET_CONTINUUM_SUBSTRACTION_DEFAULT
      };
    case DATA_PRODUCT_KIND.CONTINUUM_SPECTRAL_IMAGE:
      return { ...ids, kind, ...NEW_IMAGE_FIELDS, channelsOut: CHANNELS_OUT_MAX_COMBINED };
    case DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES:
      return {
        ...ids,
        kind,
        timeAveragingS: steppedFromPdm(1, STEPPED_FIELD.TIME_AVERAGING_S),
        frequencyAveragingKhz: steppedFromPdm(1, STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ)
      };
    case DATA_PRODUCT_KIND.PST_FLOW_THROUGH:
      return {
        ...ids,
        kind,
        polarisations: [Polarisation.X, Polarisation.Y],
        bitDepth: BIT_DEPTH_DEFAULT
      };
    case DATA_PRODUCT_KIND.PST_DETECTED_FILTERBANK:
      return {
        ...ids,
        kind,
        polarisations: [Polarisation.I],
        bitDepth: BIT_DEPTH_DEFAULT,
        outputFrequencyResolutionKhz: steppedFromPdm(
          1,
          STEPPED_FIELD.OUTPUT_FREQUENCY_RESOLUTION_KHZ
        ),
        outputSamplingIntervalMs: steppedFromPdm(1, STEPPED_FIELD.OUTPUT_SAMPLING_INTERVAL_MS),
        dispersionMeasure: 0,
        rotationMeasure: 0
      };
    case DATA_PRODUCT_KIND.PST_TIMING:
      return { ...ids, kind };
  }
};

/** The data product kind for an observation's PST mode. */
export const pstDataProductKind = (pstMode: number | undefined): DataProductKind => {
  switch (pstMode) {
    case FLOW_THROUGH_VALUE:
      return DATA_PRODUCT_KIND.PST_FLOW_THROUGH;
    case DETECTED_FILTER_BANK_VALUE:
      return DATA_PRODUCT_KIND.PST_DETECTED_FILTERBANK;
    default:
      return DATA_PRODUCT_KIND.PST_TIMING;
  }
};

type ImageDataProductInput = Extract<DataProductInput, { imageSize: unknown }>;

export const isImageDataProduct = (dp: DataProductInput): dp is ImageDataProductInput =>
  'imageSize' in dp;

/**
 * The image data product with the image and pixel sizes the observation's central frequency
 * gives (for AA2 LOW), or unchanged without a frequency.
 */
export const updateImageSizes = (
  dp: ImageDataProductInput,
  centralFrequencyMhz: number
): ImageDataProductInput => {
  if (!centralFrequencyMhz || centralFrequencyMhz <= 0) {
    return dp;
  }
  const centralWavelengthM = SPEED_OF_LIGHT / (centralFrequencyMhz * 1e6);
  const imageSizeDeg = (180 / Math.PI) * (centralWavelengthM / AA2_LOW_STATION_DIAMETER_M);
  const pixelSizeArcsec =
    (3600 * (180 / Math.PI) * (centralWavelengthM / AA2_LOW_LONGEST_BASELINE_M)) / 3;
  // Significant figures rather than decimal places, so high frequencies don't round to zero
  const significantFigures = 2;
  return {
    ...dp,
    imageSize: {
      value: Number(imageSizeDeg.toPrecision(significantFigures)),
      unit: ANGLE_UNIT.DEG
    },
    pixelSize: {
      value: Number(pixelSizeArcsec.toPrecision(significantFigures)),
      unit: ANGLE_UNIT.ARCSEC
    }
  };
};

/*********************************************************** PDM mapping *********************************************************/

const angleUnitFromPdm = (unit: string | undefined) =>
  z.enum(ANGLE_UNIT).safeParse(unit).data ?? null;

/**************************** PDM → form *****************************/

export const dataProductFromPdm = (dp: DataProductSDP): DataProductInput => {
  const ids = { id: dp.data_product_id, observationId: dp.observation_set_ref };
  const script = dp.script_parameters;

  switch (script.variant) {
    case 'continuum image':
    case 'spectral image':
    case 'continuum and spectral line image': {
      const image = {
        ...ids,
        imageSize: {
          value: script.image_size.value,
          unit: angleUnitFromPdm(script.image_size.unit)
        },
        pixelSize: {
          value: script.image_cellsize.value,
          unit: angleUnitFromPdm(script.image_cellsize.unit)
        },
        weighting: script.weight.weighting,
        robust: script.weight.robust ?? ROBUST_DEFAULT,
        taper: script.gaussian_taper ?? TAPER_DEFAULT,
        polarisations: script.polarisations,
        channelsOut: script.channels_out
      };
      if (script.variant === 'continuum image') {
        return { ...image, kind: DATA_PRODUCT_KIND.CONTINUUM_IMAGE };
      }
      if (script.variant === 'spectral image') {
        return {
          ...image,
          kind: DATA_PRODUCT_KIND.SPECTRAL_IMAGE,
          continuumSubtraction: script.continuum_subtraction
        };
      }
      return { ...image, kind: DATA_PRODUCT_KIND.CONTINUUM_SPECTRAL_IMAGE };
    }
    case 'visibilities':
      return {
        ...ids,
        kind: DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES,
        timeAveragingS: steppedFromPdm(script.time_averaging, STEPPED_FIELD.TIME_AVERAGING_S),
        frequencyAveragingKhz: steppedFromPdm(
          script.frequency_averaging,
          STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ
        )
      };
    case 'flow through':
      return {
        ...ids,
        kind: DATA_PRODUCT_KIND.PST_FLOW_THROUGH,
        polarisations: script.polarisations ?? [],
        bitDepth: script.bit_depth
      };
    case 'detected filterbank':
      return {
        ...ids,
        kind: DATA_PRODUCT_KIND.PST_DETECTED_FILTERBANK,
        polarisations: script.polarisations ?? [],
        bitDepth: script.bit_depth,
        outputFrequencyResolutionKhz: steppedFromPdm(
          script.output_frequency_resolution,
          STEPPED_FIELD.OUTPUT_FREQUENCY_RESOLUTION_KHZ
        ),
        outputSamplingIntervalMs: steppedFromPdm(
          script.output_sampling_interval,
          STEPPED_FIELD.OUTPUT_SAMPLING_INTERVAL_MS
        ),
        dispersionMeasure: script.dispersion_measure,
        rotationMeasure: script.rotation_measure
      };
    case 'pulsar timing':
      return { ...ids, kind: DATA_PRODUCT_KIND.PST_TIMING };
  }
};

export const dataProductsFromPdm = (dps: DataProductSDP[] = []): DataProductInput[] =>
  dps.map(dataProductFromPdm);

/**************************** form → PDM *****************************/

const imageToPdm = (dp: ImageDataProductValues) => ({
  image_size: dp.imageSize,
  image_cellsize: dp.pixelSize,
  weight: {
    weighting: dp.weighting,
    ...(dp.weighting === ImageWeighting.Briggs && { robust: dp.robust })
  },
  polarisations: dp.polarisations,
  channels_out: dp.channelsOut,
  gaussian_taper: dp.taper
});

const scriptParametersToPdm = (dp: DataProductValues): ScriptParameters => {
  switch (dp.kind) {
    case DATA_PRODUCT_KIND.CONTINUUM_IMAGE:
      return { ...imageToPdm(dp), kind: 'continuum', variant: 'continuum image' };
    case DATA_PRODUCT_KIND.SPECTRAL_IMAGE:
      return {
        ...imageToPdm(dp),
        continuum_subtraction: dp.continuumSubtraction,
        kind: 'spectral',
        variant: 'spectral image'
      };
    case DATA_PRODUCT_KIND.CONTINUUM_SPECTRAL_IMAGE:
      return {
        ...imageToPdm(dp),
        kind: 'continuum and spectral line',
        variant: 'continuum and spectral line image'
      };
    case DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES:
      return {
        time_averaging: steppedToPdm(dp.timeAveragingS, STEPPED_FIELD.TIME_AVERAGING_S),
        frequency_averaging: steppedToPdm(
          dp.frequencyAveragingKhz,
          STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ
        ),
        kind: 'continuum',
        variant: 'visibilities'
      };
    case DATA_PRODUCT_KIND.PST_FLOW_THROUGH:
      return {
        polarisations: dp.polarisations,
        bit_depth: dp.bitDepth,
        kind: 'pst',
        variant: 'flow through'
      };
    case DATA_PRODUCT_KIND.PST_DETECTED_FILTERBANK:
      return {
        polarisations: dp.polarisations,
        bit_depth: dp.bitDepth,
        output_frequency_resolution: steppedToPdm(
          dp.outputFrequencyResolutionKhz,
          STEPPED_FIELD.OUTPUT_FREQUENCY_RESOLUTION_KHZ
        ),
        output_sampling_interval: steppedToPdm(
          dp.outputSamplingIntervalMs,
          STEPPED_FIELD.OUTPUT_SAMPLING_INTERVAL_MS
        ),
        dispersion_measure: dp.dispersionMeasure,
        rotation_measure: dp.rotationMeasure,
        kind: 'pst',
        variant: 'detected filterbank'
      };
    case DATA_PRODUCT_KIND.PST_TIMING:
      return { kind: 'pst', variant: 'pulsar timing' };
  }
};

export const dataProductToPdm = (dp: DataProductValues): DataProductSDP => ({
  data_product_id: dp.id,
  observation_set_ref: dp.observationId,
  script_parameters: scriptParametersToPdm(dp)
});

export const dataProductsToPdm = (dps: DataProductValues[]): DataProductSDP[] =>
  dps.map(dataProductToPdm);
