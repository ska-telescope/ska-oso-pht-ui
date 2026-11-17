import { z } from 'zod';
import {
  BAND_1_STR,
  BAND_2_STR,
  BAND_3_STR,
  BAND_4_STR,
  BAND_5A_STR,
  BAND_5B_STR,
  BAND_LOW_STR,
  FIRST_COARSE_ZOOM,
  LOW_COARSE_CHANNELS_PER_BANDWIDTH_STEP,
  FREQUENCY_UNIT_HZ,
  type FrequencyUnit,
  SA_AA2,
  SA_AA_STAR,
  SA_CUSTOM,
  SUPPLIED_INTEGRATION_TIME_MAX_HOURS
} from '@/utils/constants';
import { calculateVelocity, convertFrequency, generateObsSetId } from '@/utils/helpers';
import {
  isCentralFrequencyDivisible,
  isCentralFrequencyOnChannelGrid,
  isFineZoomRestricted
} from '@/utils/zoomWindow';
import type {
  ObservatoryDataCapabilities,
  subarrayConfigurationLow,
  subarrayConfigurationMid
} from '@/utils/types/observatoryData';
import phtTranslations from '../../../public/locales/en/pht.json';
import {
  PstMode,
  ResultsType,
  type ArrayDetails,
  type LowArray,
  type MidArray,
  type ObservationSets,
  type ObservationTypeDetails,
  type Supplied
} from '@/generated/models';

export const TELESCOPE = {
  MID: 'ska_mid',
  LOW: 'ska_low'
} as const;

export type Telescope = (typeof TELESCOPE)[keyof typeof TELESCOPE];

export const OBSERVING_MODE = {
  CONTINUUM: 'continuum',
  CONTINUUM_SPECTRAL: 'continuum and spectral line',
  SPECTRAL: 'spectral line',
  PST: 'pst'
} as const;

export type ObservingMode = (typeof OBSERVING_MODE)[keyof typeof OBSERVING_MODE];

export const MID_BANDS = [
  BAND_1_STR,
  BAND_2_STR,
  BAND_3_STR,
  BAND_4_STR,
  BAND_5A_STR,
  BAND_5B_STR
] as const;
export const LOW_BANDS = [BAND_LOW_STR] as const;

export const SUBARRAYS = [SA_AA2, SA_AA_STAR, SA_CUSTOM] as const;

const FREQUENCY_UNITS = Object.keys(FREQUENCY_UNIT_HZ) as [FrequencyUnit, ...FrequencyUnit[]];

// The integration time units the editor offers, and each unit's size in hours
export const INTEGRATION_TIME_UNIT_HOURS = { h: 1, min: 1 / 60 } as const;
export type IntegrationTimeUnit = keyof typeof INTEGRATION_TIME_UNIT_HOURS;
const INTEGRATION_TIME_UNITS = Object.keys(INTEGRATION_TIME_UNIT_HOURS) as [
  IntegrationTimeUnit,
  ...IntegrationTimeUnit[]
];

// The zoom factors: each one doubles the zoom channel width, from the finest channel width up
export const LOW_ZOOM_RESOLUTIONS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export const MID_ZOOM_RESOLUTIONS = [1, 2, 3, 4, 5, 6, 7] as const;

// The channel width of zoom factor 1
const FINEST_ZOOM_CHANNEL_WIDTH_HZ = {
  [TELESCOPE.LOW]: (781250 * 32) / 27 / 4096 / 16,
  [TELESCOPE.MID]: 210
} as const;

const WEATHER_RANGE = { min: 3, max: 25 };
const SUB_BANDS_RANGE = { min: 1, max: 32 };
const ANTENNAS_15M_RANGE = { min: 0, max: 133 };
const ANTENNAS_13M_RANGE = { min: 0, max: 64 };
const STATIONS_RANGE = { min: 0, max: 512 };
const ZOOM_CHANNELS_MIN = 2;

/** The width of one zoom channel for a zoom factor. */
export const zoomChannelWidthHz = (telescope: Telescope, zoomFactor: number) =>
  FINEST_ZOOM_CHANNEL_WIDTH_HZ[telescope] * 2 ** (zoomFactor - 1);

// The spectral resolution is shown in Hz for LOW and kHz for MID
const SPECTRAL_RESOLUTION_UNIT = {
  [TELESCOPE.LOW]: 'Hz',
  [TELESCOPE.MID]: 'kHz'
} as const satisfies Record<Telescope, FrequencyUnit>;

/** The spectral resolution of a zoom factor as the user sees it, e.g. "14.13 Hz (21.2 m/s)". */
export const spectralResolutionText = (
  telescope: Telescope,
  zoomFactor: number,
  centralFrequency: { value: number | null; unit: FrequencyUnit | null }
) => {
  const widthHz = zoomChannelWidthHz(telescope, zoomFactor);
  const unit = SPECTRAL_RESOLUTION_UNIT[telescope];
  const value = Number(convertFrequency(widthHz, 'Hz', unit).toFixed(2));
  const displayFrequencyHz =
    centralFrequency.value !== null && centralFrequency.unit !== null
      ? convertFrequency(centralFrequency.value, centralFrequency.unit)
      : 0;
  return `${value} ${unit} (${calculateVelocity(widthHz, displayFrequencyHz)})`;
};

/**
 * The zoom factor of a spectral resolution saved by spectralResolutionText: the factor whose
 * channel width is nearest the leading value. Null when the text isn't one.
 *
 * TODO: Remove once the backend stores the zoom factor.
 */
export const zoomFactorFromSpectralResolution = (
  telescope: Telescope,
  text: string | null | undefined
): number | null => {
  const match = /^\s*([\d.]+)\s*(GHz|MHz|kHz|Hz)\b/.exec(text ?? '');
  if (!match) return null;
  const widthHz = convertFrequency(Number(match[1]), match[2] as FrequencyUnit);
  const factors = telescope === TELESCOPE.LOW ? LOW_ZOOM_RESOLUTIONS : MID_ZOOM_RESOLUTIONS;
  const nearest = factors.reduce((best, factor) =>
    Math.abs(zoomChannelWidthHz(telescope, factor) - widthHz) <
    Math.abs(zoomChannelWidthHz(telescope, best) - widthHz)
      ? factor
      : best
  );
  // The text rounds the width to 2 decimal places, so a saved width is within 1% of its factor's
  return Math.abs(zoomChannelWidthHz(telescope, nearest) - widthHz) <=
    0.01 * zoomChannelWidthHz(telescope, nearest)
    ? nearest
    : null;
};

// A value that can be missing in the form (e.g. not in the saved proposal) but is required to be
// valid: null in the form, and an error with the schema's own message until it is set.
const required = <T extends z.ZodType>(schema: T) =>
  z.custom<z.input<T> | null>().pipe(schema as z.ZodType<z.output<T>, z.input<T> | null>);

const rangeSchema = (range: { min: number; max: number }) =>
  required(z.number().min(range.min).max(range.max));

const wholeRangeSchema = (range: { min: number; max: number }) =>
  required(z.number().int().min(range.min).max(range.max));

// A central frequency or bandwidth
const frequencySchema = z.object({
  value: required(z.number().gt(0)),
  unit: required(z.enum(FREQUENCY_UNITS))
});

const integrationTimeSchema = z
  .object({
    value: required(z.number({ error: phtTranslations.suppliedValue.required }).gt(0)),
    // See frequencySchema
    unit: required(z.enum(INTEGRATION_TIME_UNITS))
  })
  .superRefine(({ value, unit }, ctx) => {
    // At most the maximum, in the chosen unit
    const maximum = SUPPLIED_INTEGRATION_TIME_MAX_HOURS / INTEGRATION_TIME_UNIT_HOURS[unit];
    if (value > maximum) {
      ctx.addIssue({
        code: 'too_big',
        origin: 'number',
        maximum,
        inclusive: true,
        input: value,
        path: ['value']
      });
    }
  });

const subarraySchema = required(
  z.enum(SUBARRAYS, { error: phtTranslations.subArrayConfiguration.error })
);

// The schema messages don't go through i18next, so the placeholder is filled in here
const zoomChannelsMessage = phtTranslations.zoomChannels.error.replace(
  '{{min}}',
  String(ZOOM_CHANNELS_MIN)
);

const observationBaseSchema = z.object({
  id: z.string(),
  groupId: z.string().nullable(),
  integrationTime: integrationTimeSchema
});

// The fields each observing mode adds. A spectral line observation has no bandwidth of its own:
// it is its number of channels times the channel width of its zoom factor.
const observingModeVariants = <Factor extends number>(zoomFactors: readonly Factor[]) => ({
  continuum: {
    observingMode: z.literal(OBSERVING_MODE.CONTINUUM),
    bandwidth: frequencySchema
  },
  continuumSpectral: {
    observingMode: z.literal(OBSERVING_MODE.CONTINUUM_SPECTRAL),
    bandwidth: frequencySchema
  },
  spectral: {
    observingMode: z.literal(OBSERVING_MODE.SPECTRAL),
    zoomFactor: required(
      z.literal(zoomFactors, { error: phtTranslations.spectralResolution.error })
    ),
    zoomChannels: required(
      z
        .number({ error: zoomChannelsMessage })
        // A whole number checked with a refine rather than .int(), which would stop the
        // observation's own rules (the zoom factor of AA2 and AA*) from being checked
        .refine(
          (value) => Number.isInteger(value) && value >= ZOOM_CHANNELS_MIN,
          zoomChannelsMessage
        )
    )
  },
  pst: {
    observingMode: z.literal(OBSERVING_MODE.PST),
    bandwidth: frequencySchema,
    pstMode: required(z.enum(PstMode, { error: phtTranslations.pstMode.error }))
  }
});

/** The OSD capabilities the observation rules use. */
export type ObservationOsd = Partial<ObservatoryDataCapabilities>;

// The channel width of MID, which a MID bandwidth is a multiple of
// TODO: Take it from the OSD once it has it
const MID_CHANNEL_WIDTH_HZ = 13440;

const elevationSchema = (
  limits: { minElevationDeg: number; maxElevationDeg: number } | null | undefined
) =>
  limits
    ? rangeSchema({ min: limits.minElevationDeg, max: limits.maxElevationDeg })
    : required(z.number());

// A frequency in Hz, or null while its value or unit isn't set
const frequencyHzOf = (frequency: { value: number | null; unit: FrequencyUnit | null }) =>
  frequency.value !== null && frequency.unit !== null
    ? convertFrequency(frequency.value, frequency.unit)
    : null;

/**
 * The rules that need the OSD: the band, the subarray and the channel widths. Each one is checked
 * only when the values it needs are set, and shows on the field the user changes to fix it.
 */
const osdRules =
  (osd: ObservationOsd) =>
  (obs: ObservationInput, ctx: z.RefinementCtx): void => {
    const isLow = obs.telescope === TELESCOPE.LOW;
    const capabilities = isLow ? osd.low : osd.mid;
    if (!capabilities) {
      return;
    }
    const band = isLow
      ? osd.low?.basicCapabilities
      : osd.mid?.basicCapabilities.receiverInformation.find((rx) => rx.rxId === obs.observingBand);
    const subarray = (
      capabilities.subArrays as (subarrayConfigurationLow | subarrayConfigurationMid)[]
    ).find((sub) => sub.subArray === obs.subarray);
    const coarseChannelWidthHz = osd.low?.basicCapabilities.coarseChannelWidthHz;

    const isSpectral = obs.observingMode === OBSERVING_MODE.SPECTRAL;
    const zoomChannels = isSpectral ? obs.zoomChannels : null;
    const channelWidthHz =
      isSpectral && obs.zoomFactor !== null
        ? zoomChannelWidthHz(obs.telescope, obs.zoomFactor)
        : null;
    const centralHz = frequencyHzOf(obs.centralFrequency);
    // A spectral line observation's bandwidth is its channels times their width
    const bandwidthHz = isSpectral
      ? channelWidthHz !== null && zoomChannels !== null
        ? zoomChannels * channelWidthHz
        : null
      : frequencyHzOf(obs.bandwidth);

    // The whole bandwidth is in the band. Without a bandwidth yet, the central frequency is.
    if (centralHz !== null && band) {
      const halfBandwidthHz = (bandwidthHz ?? 0) / 2;
      if (
        Math.round(centralHz - halfBandwidthHz) < band.minFrequencyHz ||
        Math.round(centralHz + halfBandwidthHz) > band.maxFrequencyHz
      ) {
        ctx.addIssue({
          code: 'custom',
          message: phtTranslations.centralFrequency.error.range,
          path: ['centralFrequency', 'value']
        });
      } else if (isLow && coarseChannelWidthHz !== undefined) {
        // On LOW the central frequency is on the channel grid: the zoom channels' for a spectral
        // line observation, the coarse channels' for the others
        const onGrid = isSpectral
          ? channelWidthHz === null ||
            zoomChannels === null ||
            isCentralFrequencyOnChannelGrid(
              centralHz,
              channelWidthHz,
              zoomChannels * channelWidthHz,
              band.minFrequencyHz
            )
          : isCentralFrequencyDivisible(centralHz, coarseChannelWidthHz);
        if (!onGrid) {
          ctx.addIssue({
            code: 'custom',
            message: phtTranslations.centralFrequency.error.divisibility,
            path: ['centralFrequency', 'value']
          });
        }
      }
    }

    // A bandwidth of its own is a whole number of channels, at most what the subarray has
    if (!isSpectral && bandwidthHz !== null) {
      const channelHz = isLow
        ? coarseChannelWidthHz !== undefined
          ? coarseChannelWidthHz * LOW_COARSE_CHANNELS_PER_BANDWIDTH_STEP
          : null
        : MID_CHANNEL_WIDTH_HZ;
      const maximumHz = subarray?.availableBandwidthHz;
      const message = (
        key: 'minimumChannelWidthError' | 'contMaximumExceededError' | 'divisibilityError',
        valueHz: number,
        unit: FrequencyUnit
      ) =>
        phtTranslations.bandwidth.range[key].replace(
          '{{value}}',
          convertFrequency(valueHz, 'Hz', unit).toFixed(2)
        );
      const bandwidthIssue =
        channelHz !== null && bandwidthHz < channelHz
          ? message('minimumChannelWidthError', channelHz, 'kHz')
          : maximumHz !== undefined && bandwidthHz > maximumHz
            ? message('contMaximumExceededError', maximumHz, 'MHz')
            : channelHz !== null &&
                Math.abs(bandwidthHz / channelHz - Math.round(bandwidthHz / channelHz)) > 1e-6
              ? message('divisibilityError', channelHz, 'kHz')
              : null;
      if (bandwidthIssue) {
        ctx.addIssue({ code: 'custom', message: bandwidthIssue, path: ['bandwidth', 'value'] });
      }
    }

    // A spectral line observation has at most the zoom channels of its subarray
    if (
      isSpectral &&
      zoomChannels !== null &&
      subarray &&
      zoomChannels > subarray.numberZoomChannels
    ) {
      ctx.addIssue({
        code: 'too_big',
        origin: 'number',
        maximum: subarray.numberZoomChannels,
        inclusive: true,
        input: zoomChannels,
        path: ['zoomChannels']
      });
    }

    // Each MID continuum sub-band is at least a channel wide
    const subBands = isLow ? null : obs.numberOfSubBands;
    if (
      (obs.observingMode === OBSERVING_MODE.CONTINUUM ||
        obs.observingMode === OBSERVING_MODE.CONTINUUM_SPECTRAL) &&
      bandwidthHz !== null &&
      subBands !== null &&
      subBands > 0 &&
      bandwidthHz / subBands < MID_CHANNEL_WIDTH_HZ
    ) {
      ctx.addIssue({
        code: 'custom',
        message: phtTranslations.subBands.range.bandwidthSubBand,
        path: ['numberOfSubBands']
      });
    }
  };

// The OSD rules run even when other fields have issues, so each field shows its error at once
// Typed as the schema it is given, which the rules don't change. Inferring it would go through
// the rules, which use ObservationInput, the type of this same schema.
const withOsdRules = <T extends z.ZodType>(schema: T, osd: ObservationOsd): T =>
  schema.superRefine(
    // With `when`, the rules also run on values that aren't valid, so they read the form's input
    (obs, ctx) => osdRules(osd)(obs as ObservationInput, ctx),
    { when: () => true }
  );

const midBaseSchema = observationBaseSchema.extend({
  telescope: z.literal(TELESCOPE.MID),
  observingBand: required(z.enum(MID_BANDS, { error: phtTranslations.observingBand.error })),
  subarray: subarraySchema,
  centralFrequency: frequencySchema,
  weather: rangeSchema(WEATHER_RANGE),
  number15mAntennas: wholeRangeSchema(ANTENNAS_15M_RANGE).optional(),
  number13mAntennas: wholeRangeSchema(ANTENNAS_13M_RANGE).optional(),
  numberOfSubBands: wholeRangeSchema(SUB_BANDS_RANGE)
});

const lowBaseSchema = observationBaseSchema.extend({
  telescope: z.literal(TELESCOPE.LOW),
  observingBand: required(z.enum(LOW_BANDS, { error: phtTranslations.observingBand.error })),
  subarray: subarraySchema,
  centralFrequency: frequencySchema,
  numberOfStations: wholeRangeSchema(STATIONS_RANGE).optional()
});

const midModes = observingModeVariants(MID_ZOOM_RESOLUTIONS);
const lowModes = observingModeVariants(LOW_ZOOM_RESOLUTIONS);

const midObservationSchema = (osd: ObservationOsd) => {
  const base = midBaseSchema.extend({
    elevation: elevationSchema(osd.mid?.basicCapabilities)
  });
  return z.discriminatedUnion('observingMode', [
    withOsdRules(base.extend(midModes.continuum), osd),
    withOsdRules(base.extend(midModes.continuumSpectral), osd),
    withOsdRules(base.extend(midModes.spectral), osd),
    withOsdRules(base.extend(midModes.pst), osd)
  ]);
};

const lowObservationSchema = (osd: ObservationOsd) => {
  const base = lowBaseSchema.extend({
    minElevation: elevationSchema(osd.low?.basicCapabilities)
  });
  return z.discriminatedUnion('observingMode', [
    withOsdRules(base.extend(lowModes.continuum), osd),
    withOsdRules(base.extend(lowModes.continuumSpectral), osd),
    withOsdRules(
      base
        .extend(lowModes.spectral)
        // AA2 and AA* have only the coarse zoom factors. Checked even when other fields have
        // issues, so the field shows it at once.
        .refine(
          (obs) =>
            !isFineZoomRestricted(obs.subarray ?? undefined) ||
            typeof obs.zoomFactor !== 'number' ||
            obs.zoomFactor >= FIRST_COARSE_ZOOM,
          {
            message: phtTranslations.spectralResolution.restrictedError,
            path: ['zoomFactor'],
            when: () => true
          }
        ),
      osd
    ),
    withOsdRules(base.extend(lowModes.pst), osd)
  ]);
};

export function getObservationSchema(osd: ObservationOsd = {}) {
  return z.discriminatedUnion('telescope', [midObservationSchema(osd), lowObservationSchema(osd)]);
}

export function getObservationsSchema(osd: ObservationOsd = {}) {
  return z.array(getObservationSchema(osd));
}

/** An observation as the form holds it. */
export type ObservationInput = z.input<ReturnType<typeof getObservationSchema>>;

/** A valid observation. */
export type ObservationValues = z.output<ReturnType<typeof getObservationSchema>>;

type MidObservationValues = Extract<ObservationValues, { telescope: typeof TELESCOPE.MID }>;
type LowObservationValues = Extract<ObservationValues, { telescope: typeof TELESCOPE.LOW }>;

/*********************************************************** PDM mapping ***********************************************************/

const oneOf = <T extends string>(values: readonly T[], value: string | null | undefined) =>
  values.find((option) => option === value) ?? null;

const frequencyFromPdm = (quantity: { value: number; unit?: string } | undefined) => ({
  value: quantity?.value ?? null,
  unit: oneOf(FREQUENCY_UNITS, quantity?.unit)
});

const integrationTimeFromPdm = (supplied: Supplied | null | undefined) => ({
  value: supplied?.quantity.value ?? null,
  unit: oneOf(INTEGRATION_TIME_UNITS, supplied?.quantity.unit)
});

const observingModeFromPdm = (details: ObservationTypeDetails, telescope: Telescope) => {
  switch (details.observation_type) {
    case OBSERVING_MODE.SPECTRAL:
      return {
        observingMode: OBSERVING_MODE.SPECTRAL,
        zoomFactor: zoomFactorFromSpectralResolution(telescope, details.spectral_resolution),
        zoomChannels: details.number_of_channels ?? null
      };
    case OBSERVING_MODE.PST:
      return {
        observingMode: OBSERVING_MODE.PST,
        bandwidth: frequencyFromPdm(details.bandwidth),
        pstMode: oneOf(Object.values(PstMode), details.pst_mode)
      };
    default:
      return {
        observingMode: details.observation_type,
        bandwidth: frequencyFromPdm(details.bandwidth)
      };
  }
};

export const observationFromPdm = (observation: ObservationSets): ObservationInput => {
  const details = observation.observation_type_details;
  const shared = {
    id: observation.observation_set_id,
    groupId: observation.group_id || null,
    integrationTime: integrationTimeFromPdm(details.supplied),
    centralFrequency: frequencyFromPdm(details.central_frequency)
  };
  if (observation.array_details.array === TELESCOPE.MID) {
    const array = observation.array_details as MidArray;
    return {
      ...shared,
      telescope: TELESCOPE.MID,
      observingBand: oneOf(MID_BANDS, observation.observing_band),
      subarray: oneOf(SUBARRAYS, array.subarray),
      elevation: observation.elevation ?? null,
      weather: array.weather ?? null,
      number15mAntennas: array.number_15_antennas,
      number13mAntennas: array.number_13_antennas,
      numberOfSubBands: array.number_sub_bands ?? 1,
      ...observingModeFromPdm(details, TELESCOPE.MID)
    } as ObservationInput;
  }
  const array = observation.array_details as LowArray;
  return {
    ...shared,
    telescope: TELESCOPE.LOW,
    observingBand: oneOf(LOW_BANDS, observation.observing_band),
    subarray: oneOf(SUBARRAYS, array.subarray),
    minElevation: observation.elevation ?? null,
    numberOfStations: array.number_of_stations,
    ...observingModeFromPdm(details, TELESCOPE.LOW)
  } as ObservationInput;
};

export const observationsFromPdm = (observations: ObservationSets[] | null | undefined = []) =>
  (observations ?? []).map(observationFromPdm);

const arrayDetailsToPdm = (obs: ObservationValues): ArrayDetails =>
  obs.telescope === TELESCOPE.MID
    ? {
        array: TELESCOPE.MID,
        subarray: obs.subarray,
        weather: obs.weather,
        number_15_antennas: obs.number15mAntennas,
        number_13_antennas: obs.number13mAntennas,
        number_sub_bands: obs.numberOfSubBands
      }
    : {
        array: TELESCOPE.LOW,
        subarray: obs.subarray,
        number_of_stations: obs.numberOfStations
      };

const observationTypeDetailsToPdm = (
  obs: MidObservationValues | LowObservationValues
): ObservationTypeDetails => {
  const shared = {
    central_frequency: obs.centralFrequency,
    supplied: {
      supplied_type: ResultsType.IntegrationTime,
      quantity: obs.integrationTime
    }
  };
  switch (obs.observingMode) {
    case OBSERVING_MODE.SPECTRAL: {
      const widthHz = zoomChannelWidthHz(obs.telescope, obs.zoomFactor);
      return {
        ...shared,
        observation_type: OBSERVING_MODE.SPECTRAL,
        bandwidth: {
          value: convertFrequency(obs.zoomChannels * widthHz, 'Hz', 'MHz'),
          unit: 'MHz'
        },
        spectral_resolution: spectralResolutionText(
          obs.telescope,
          obs.zoomFactor,
          obs.centralFrequency
        ),
        number_of_channels: obs.zoomChannels
      };
    }
    case OBSERVING_MODE.PST:
      return {
        ...shared,
        observation_type: OBSERVING_MODE.PST,
        bandwidth: obs.bandwidth,
        pst_mode: obs.pstMode
      };
    default:
      return { ...shared, observation_type: obs.observingMode, bandwidth: obs.bandwidth };
  }
};

export const observationToPdm = (obs: ObservationValues): ObservationSets => ({
  observation_set_id: obs.id,
  ...(obs.groupId !== null && { group_id: obs.groupId }),
  observing_band: obs.observingBand,
  elevation: obs.telescope === TELESCOPE.MID ? obs.elevation : obs.minElevation,
  array_details: arrayDetailsToPdm(obs),
  observation_type_details: observationTypeDetailsToPdm(obs)
});

export const observationsToPdm = (observations: ObservationValues[]) =>
  observations.map(observationToPdm);

/**
 * The observation an SV proposal starts with, and gets again when its observing mode changes: a
 * LOW AA2 observation in the given mode. The minimum elevation is the OSD's lowest, and a spectral
 * line observation uses all the zoom channels the subarray has.
 */
export const newSvObservation = (
  observingMode: ObservingMode,
  minElevation: number | null,
  maxZoomChannels?: number
): ObservationInput => {
  const shared = {
    id: generateObsSetId(),
    groupId: null,
    telescope: TELESCOPE.LOW,
    observingBand: BAND_LOW_STR,
    subarray: SA_AA2,
    minElevation,
    numberOfStations: 68,
    integrationTime: { value: 1, unit: 'h' }
  } as const;
  const centralFrequency = { value: 199.609375, unit: 'MHz' } as const;
  const bandwidth = { value: 150, unit: 'MHz' } as const;
  switch (observingMode) {
    case OBSERVING_MODE.SPECTRAL:
      return {
        ...shared,
        observingMode,
        centralFrequency: { value: 200, unit: 'MHz' },
        zoomFactor: 8,
        zoomChannels: maxZoomChannels ?? 1000
      };
    case OBSERVING_MODE.PST:
      return {
        ...shared,
        observingMode,
        centralFrequency,
        bandwidth,
        pstMode: PstMode.PulsarTiming
      };
    default:
      return { ...shared, observingMode, centralFrequency, bandwidth };
  }
};
