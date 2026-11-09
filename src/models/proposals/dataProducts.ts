import { z } from 'zod';
import {
  CHANNELS_OUT_MAX,
  CHANNELS_OUT_MAX_COMBINED,
  CHANNELS_OUT_MIN_CONTINUUM,
  CHANNELS_OUT_MIN_SPECTRAL,
  PST_DEDICATED_FILTERBANK_BIT_DEPTH_VALUES,
  PST_FLOW_THROUGH_BIT_DEPTH_VALUES,
  ROBUST_DEFAULT,
  TAPER_DEFAULT
} from '@/utils/constants';
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

export const ANGLE_UNIT = {
  DEG: 'deg',
  ARCMIN: 'arcmin',
  ARCSEC: 'arcsec'
} as const;

// The unit is a required dropdown. It is null in the form when none is chosen, such as when the
// backend sent a unit the editor doesn't know, and is only valid once one is chosen.
const angleSchema = (valueSchema: z.ZodNumber) =>
  z.object({
    value: valueSchema,
    unit: z.enum(ANGLE_UNIT).nullable().pipe(z.enum(ANGLE_UNIT))
  });

const ROBUST_RANGE = { min: -2, max: 2 };
const AVERAGING_MULTIPLIER_RANGE = { min: 1, max: 12 };
const DISPERSION_MEASURE_MIN = 0;

const averagingSchema = z
  .number()
  .int()
  .min(AVERAGING_MULTIPLIER_RANGE.min)
  .max(AVERAGING_MULTIPLIER_RANGE.max);

const polarisationsSchema = z.array(z.enum(Polarisation)).min(1);

const channelsOutSchema = (min: number, max: number) => z.number().int().min(min).max(max);

const dataProductBaseSchema = z.object({
  id: z.string(),
  observationId: z.string()
});

const imageDataProductSchema = dataProductBaseSchema.extend({
  imageSize: angleSchema(z.number().gt(0)),
  pixelSize: angleSchema(z.number().gt(0)),
  weighting: z.enum(ImageWeighting),
  robust: z.number().min(ROBUST_RANGE.min).max(ROBUST_RANGE.max),
  taper: z.number().min(0),
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
      timeAveraging: averagingSchema,
      frequencyAveraging: averagingSchema
    }),
    dataProductBaseSchema.extend({
      kind: z.literal(DATA_PRODUCT_KIND.PST_FLOW_THROUGH),
      polarisations: polarisationsSchema,
      bitDepth: z.number().refine((value) => PST_FLOW_THROUGH_BIT_DEPTH_VALUES.includes(value))
    }),
    dataProductBaseSchema.extend({
      kind: z.literal(DATA_PRODUCT_KIND.PST_DETECTED_FILTERBANK),
      polarisations: polarisationsSchema,
      bitDepth: z
        .number()
        .refine((value) => PST_DEDICATED_FILTERBANK_BIT_DEPTH_VALUES.includes(value)),
      outputFrequencyResolution: z.number().int().min(1),
      outputSamplingInterval: z.number().int().min(1),
      dispersionMeasure: z.number().min(DISPERSION_MEASURE_MIN),
      rotationMeasure: z.number()
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
        timeAveraging: script.time_averaging,
        frequencyAveraging: script.frequency_averaging
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
        outputFrequencyResolution: script.output_frequency_resolution,
        outputSamplingInterval: script.output_sampling_interval,
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
        time_averaging: dp.timeAveraging,
        frequency_averaging: dp.frequencyAveraging,
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
        output_frequency_resolution: dp.outputFrequencyResolution,
        output_sampling_interval: dp.outputSamplingInterval,
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
