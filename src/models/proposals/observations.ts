import { z } from 'zod';
import { required } from './required';
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
  SUPPLIED_INTEGRATION_TIME_MAX_HOURS,
  TELESCOPE_LOW_NUM,
  TELESCOPE_MID_NUM
} from '@/utils/constants';
import { calculateVelocity, convertFrequency, generateObsSetId } from '@/utils/helpers';
import { isFineZoomRestricted, snapCentralFrequencyToChannelGridHz } from '@/utils/zoomWindow';
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

/** The number the library's telescope colours (getColors) key each telescope on */
export const TELESCOPE_NUMBER: Record<Telescope, number> = {
  [TELESCOPE.MID]: TELESCOPE_MID_NUM,
  [TELESCOPE.LOW]: TELESCOPE_LOW_NUM
};

export const OBSERVING_MODE = {
  CONTINUUM: 'continuum',
  CONTINUUM_SPECTRAL: 'continuum and spectral line',
  SPECTRAL: 'spectral line',
  PST: 'pst'
} as const;

export type ObservingMode = (typeof OBSERVING_MODE)[keyof typeof OBSERVING_MODE];

/** The key of each observing mode's name in the observationType translations. */
export const OBSERVING_MODE_TRANSLATION_KEY: Record<ObservingMode, string> = {
  [OBSERVING_MODE.CONTINUUM]: 'continuum',
  [OBSERVING_MODE.CONTINUUM_SPECTRAL]: 'continuumSpectral',
  [OBSERVING_MODE.SPECTRAL]: 'spectral',
  [OBSERVING_MODE.PST]: 'pst'
};

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
export type Subarray = (typeof SUBARRAYS)[number];
export type ObservingBand = (typeof MID_BANDS)[number] | (typeof LOW_BANDS)[number];

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
/**
 * A spectral line observation's bandwidth: its channels times their width, in the unit given and
 * to the 0.01 Hz it is shown to. Missing while the zoom factor or channels are.
 */
export const spectralBandwidth = (
  telescope: Telescope,
  zoomFactor: number | null,
  zoomChannels: number | null,
  unit: FrequencyUnit
) => {
  if (zoomFactor === null || zoomChannels === null) {
    return { value: null, unit };
  }
  const decimalPlaces = Math.round(Math.log10(FREQUENCY_UNIT_HZ[unit])) + 2;
  const value = convertFrequency(
    zoomChannels * zoomChannelWidthHz(telescope, zoomFactor),
    'Hz',
    unit
  );
  return { value: Number(value.toFixed(decimalPlaces)), unit };
};

/**
 * The channels of a spectral line bandwidth. A bandwidth within the 0.01 Hz it is shown to of a
 * whole number of channels is that number; any other gives a fraction, which is an error until the
 * user corrects it. Missing while the zoom factor or bandwidth is.
 */
export const zoomChannelsForBandwidth = (
  telescope: Telescope,
  zoomFactor: number | null,
  bandwidth: { value: number | null; unit: FrequencyUnit | null }
): number | null => {
  if (zoomFactor === null || bandwidth.value === null || bandwidth.unit === null) {
    return null;
  }
  const widthHz = zoomChannelWidthHz(telescope, zoomFactor);
  const channels = convertFrequency(bandwidth.value, bandwidth.unit) / widthHz;
  return Math.abs(channels - Math.round(channels)) * widthHz < 0.01
    ? Math.round(channels)
    : channels;
};

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

// The fields each observing mode adds. A spectral line observation's bandwidth is its number of
// channels times the channel width of its zoom factor: the form holds it too, so both fields can
// be edited, and keeps it the same as the channels (see spectralBandwidth).
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
    bandwidth: frequencySchema,
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

// The channel width of MID. A MID sub-band is at least a channel wide.
// TODO: Take it from the OSD once it has it
export const MID_CHANNEL_WIDTH_HZ = 13440;

/**
 * The step a bandwidth of its own is a whole number of: 8 coarse channels on LOW, and 20 channels
 * on MID (as in the ODT), or null while the OSD isn't loaded.
 */
export const bandwidthStepHz = (telescope: Telescope, osd: ObservationOsd): number | null =>
  telescope === TELESCOPE.LOW
    ? osd.low
      ? osd.low.basicCapabilities.coarseChannelWidthHz * LOW_COARSE_CHANNELS_PER_BANDWIDTH_STEP
      : null
    : osd.mid
      ? 20 * MID_CHANNEL_WIDTH_HZ
      : null;

/**
 * The grid a LOW central frequency is on, as its step and lowest point: two coarse channels, or a
 * zoom channel for a spectral line observation, whose grid moves by half a channel with an odd
 * number of channels. MID has no grid. Null while the OSD or the values it needs aren't there.
 */
export const centralFrequencyGridHz = (
  observation: ObservationInput,
  osd: ObservationOsd
): { stepHz: number; minHz: number } | null => {
  if (observation.telescope !== TELESCOPE.LOW || !osd.low) {
    return null;
  }
  const minHz = osd.low.basicCapabilities.minFrequencyHz;
  if (observation.observingMode !== OBSERVING_MODE.SPECTRAL) {
    return { stepHz: 2 * osd.low.basicCapabilities.coarseChannelWidthHz, minHz };
  }
  if (observation.zoomFactor === null || observation.zoomChannels === null) {
    return null;
  }
  const widthHz = zoomChannelWidthHz(TELESCOPE.LOW, observation.zoomFactor);
  return {
    stepHz: widthHz,
    minHz: minHz + (Math.round(observation.zoomChannels) % 2) * (widthHz / 2)
  };
};

/** The frequency range of a band, from the OSD. */
export const bandRange = (
  osd: ObservationOsd,
  telescope: Telescope,
  observingBand: ObservingBand | null
): { minFrequencyHz: number; maxFrequencyHz: number } | undefined =>
  telescope === TELESCOPE.LOW
    ? osd.low?.basicCapabilities
    : osd.mid?.basicCapabilities.receiverInformation.find((rx) => rx.rxId === observingBand);

/**
 * What the frequency spectrum shows of an observation: its band and central frequency in the
 * telescope's unit (MHz for LOW, GHz for MID), and its bandwidth in MHz. A value that isn't set
 * shows as 0.
 */
export const spectrumOf = (observation: ObservationInput, osd: ObservationOsd) => {
  const unit = observation.telescope === TELESCOPE.LOW ? 'MHz' : 'GHz';
  const display = (hz: number | null | undefined) =>
    hz === null || hz === undefined ? 0 : convertFrequency(hz, 'Hz', unit);
  const band = bandRange(osd, observation.telescope, observation.observingBand);
  const bandwidthHz = frequencyHzOf(observation.bandwidth);
  return {
    minFreq: display(band?.minFrequencyHz),
    maxFreq: display(band?.maxFrequencyHz),
    centerFreq: display(frequencyHzOf(observation.centralFrequency)),
    bandWidth: bandwidthHz === null ? 0 : convertFrequency(bandwidthHz, 'Hz', 'MHz'),
    unit
  };
};

/** What a subarray of a telescope has, from the OSD. A custom subarray isn't in it. */
export const subarrayCapabilities = (
  osd: ObservationOsd,
  telescope: Telescope,
  subarray: Subarray | null
): subarrayConfigurationLow | subarrayConfigurationMid | undefined =>
  (
    (telescope === TELESCOPE.LOW ? osd.low?.subArrays : osd.mid?.subArrays) as
      (subarrayConfigurationLow | subarrayConfigurationMid)[] | undefined
  )?.find((sub) => sub.subArray === subarray);

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
    if (!(isLow ? osd.low : osd.mid)) {
      return;
    }
    const band = bandRange(osd, obs.telescope, obs.observingBand);
    const subarray = subarrayCapabilities(osd, obs.telescope, obs.subarray);

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
      } else {
        // On LOW, to within 1 Hz, as values are shown and entered to the Hz
        const grid = centralFrequencyGridHz(obs, osd);
        const stepsFromMin = grid ? (centralHz - grid.minHz) / grid.stepHz : 0;
        if (grid && Math.abs(stepsFromMin - Math.round(stepsFromMin)) * grid.stepHz >= 1) {
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
      const channelHz = bandwidthStepHz(obs.telescope, osd);
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
      // And the bandwidth that sets them, as the widest bandwidth in its unit
      const unit = obs.bandwidth.unit;
      if (channelWidthHz !== null && unit !== null && obs.bandwidth.value !== null) {
        ctx.addIssue({
          code: 'too_big',
          origin: 'number',
          maximum: convertFrequency(subarray.numberZoomChannels * channelWidthHz, 'Hz', unit),
          inclusive: true,
          input: obs.bandwidth.value,
          path: ['bandwidth', 'value']
        });
      }
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

const hasWholeChannels = (obs: { zoomChannels: unknown }) =>
  typeof obs.zoomChannels !== 'number' ||
  (Number.isInteger(obs.zoomChannels) && obs.zoomChannels >= ZOOM_CHANNELS_MIN);
const onBandwidth = {
  message: zoomChannelsMessage,
  path: ['bandwidth', 'value'],
  when: () => true
};

const midModes = observingModeVariants(MID_ZOOM_RESOLUTIONS);
const lowModes = observingModeVariants(LOW_ZOOM_RESOLUTIONS);

const midObservationSchema = (osd: ObservationOsd) => {
  const base = midBaseSchema.extend({
    elevation: elevationSchema(osd.mid?.basicCapabilities)
  });
  return z.discriminatedUnion('observingMode', [
    withOsdRules(base.extend(midModes.continuum), osd),
    withOsdRules(base.extend(midModes.continuumSpectral), osd),
    withOsdRules(base.extend(midModes.spectral).refine(hasWholeChannels, onBandwidth), osd),
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
        .refine(hasWholeChannels, onBandwidth)
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

export type MidObservationValues = Extract<ObservationValues, { telescope: typeof TELESCOPE.MID }>;
export type LowObservationValues = Extract<ObservationValues, { telescope: typeof TELESCOPE.LOW }>;

/*********************************************************** PDM mapping ***********************************************************/

const oneOf = <T extends string>(values: readonly T[], value: string | null | undefined) =>
  values.find((option) => option === value) ?? null;

const frequencyFromPdm = (quantity: { value: number; unit?: string } | undefined) => {
  const unit = oneOf(FREQUENCY_UNITS, quantity?.unit);
  if (quantity?.value === undefined || unit === null) {
    return { value: quantity?.value ?? null, unit };
  }
  return {
    value: Number(convertFrequency(quantity.value, unit, 'MHz').toFixed(6)),
    unit: 'MHz' as const
  };
};

const integrationTimeFromPdm = (supplied: Supplied | null | undefined) => ({
  value: supplied?.quantity.value ?? null,
  unit: oneOf(INTEGRATION_TIME_UNITS, supplied?.quantity.unit)
});

const observingModeFromPdm = (details: ObservationTypeDetails, telescope: Telescope) => {
  switch (details.observation_type) {
    case OBSERVING_MODE.SPECTRAL: {
      const zoomFactor = zoomFactorFromSpectralResolution(telescope, details.spectral_resolution);
      const zoomChannels = details.number_of_channels ?? null;
      return {
        observingMode: OBSERVING_MODE.SPECTRAL,
        // Taken from the channels, which are what counts, in the unit it was saved in
        bandwidth: spectralBandwidth(
          telescope,
          zoomFactor,
          zoomChannels,
          // A spectral line bandwidth is shown in kHz or MHz
          details.bandwidth?.unit === 'kHz' ? 'kHz' : 'MHz'
        ),
        zoomFactor,
        zoomChannels
      };
    }
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
        // From the channels, which are what counts, in the bandwidth's unit
        bandwidth: {
          value: convertFrequency(obs.zoomChannels * widthHz, 'Hz', obs.bandwidth.unit),
          unit: obs.bandwidth.unit
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
  maxZoomChannels?: number,
  pstMode: PstMode = PstMode.PulsarTiming
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
        bandwidth: spectralBandwidth(TELESCOPE.LOW, 8, maxZoomChannels ?? 1000, 'MHz'),
        zoomFactor: 8,
        zoomChannels: maxZoomChannels ?? 1000
      };
    case OBSERVING_MODE.PST:
      return {
        ...shared,
        observingMode,
        centralFrequency,
        bandwidth,
        pstMode
      };
    default:
      return { ...shared, observingMode, centralFrequency, bandwidth };
  }
};

/*********************************************************** defaults and changes ***********************************************************/

export const telescopeOfBand = (observingBand: ObservingBand): Telescope =>
  observingBand === BAND_LOW_STR ? TELESCOPE.LOW : TELESCOPE.MID;

// The coarsest zoom factor, which every subarray has
const DEFAULT_ZOOM_FACTOR = { [TELESCOPE.LOW]: 8, [TELESCOPE.MID]: 1 } as const;

// The fields that depend on the telescope only: the integration time and elevation defaults
const telescopeDefaults = (telescope: Telescope, osd: ObservationOsd) =>
  telescope === TELESCOPE.LOW
    ? {
        telescope,
        integrationTime: { value: 1, unit: 'h' as const },
        minElevation: osd.low?.basicCapabilities.minElevationDeg ?? null
      }
    : {
        telescope,
        integrationTime: { value: 10, unit: 'min' as const },
        elevation: osd.mid?.basicCapabilities.minElevationDeg ?? null,
        weather: phtTranslations.weather.default,
        numberOfSubBands: 1
      };

// The stations or antennas of a subarray. A custom one has none until the user enters them.
const arrayDefaults = (telescope: Telescope, subarray: Subarray | null, osd: ObservationOsd) => {
  const capabilities = subarrayCapabilities(osd, telescope, subarray);
  return telescope === TELESCOPE.LOW
    ? { numberOfStations: (capabilities as subarrayConfigurationLow)?.numberStations ?? null }
    : {
        number15mAntennas: (capabilities as subarrayConfigurationMid)?.numberSkaDishes ?? null,
        number13mAntennas: (capabilities as subarrayConfigurationMid)?.numberMeerkatDishes ?? null
      };
};

/**
 * The widest bandwidth of its own an observation can have: whole steps (see bandwidthStepHz) within
 * both the band and what the subarray has. Null while the OSD isn't loaded.
 */
export const widestBandwidthHz = (
  telescope: Telescope,
  observingBand: ObservingBand | null,
  subarray: Subarray | null,
  osd: ObservationOsd
): number | null => {
  const band = bandRange(osd, telescope, observingBand);
  const stepHz = bandwidthStepHz(telescope, osd);
  const maximumHz = Math.min(
    subarrayCapabilities(osd, telescope, subarray)?.availableBandwidthHz ?? Infinity,
    band ? band.maxFrequencyHz - band.minFrequencyHz : Infinity
  );
  return stepHz !== null && Number.isFinite(maximumHz)
    ? Math.floor(maximumHz / stepHz) * stepHz
    : null;
};

/**
 * The frequencies an observation starts with in a band, which are valid for the subarray: the
 * middle of the band, and the widest bandwidth (see widestBandwidthHz). A spectral line observation uses the coarsest zoom factor and all the zoom channels
 * of the subarray, with its central frequency moved onto their channel grid on LOW.
 */
const frequencyDefaults = (
  telescope: Telescope,
  observingBand: ObservingBand | null,
  subarray: Subarray | null,
  observingMode: ObservingMode,
  osd: ObservationOsd
) => {
  const band = bandRange(osd, telescope, observingBand);
  const centreHz = band ? (band.minFrequencyHz + band.maxFrequencyHz) / 2 : null;
  const mhz = (hz: number | null) => ({
    value: hz === null ? null : convertFrequency(hz, 'Hz', 'MHz'),
    unit: 'MHz' as const
  });
  if (observingMode === OBSERVING_MODE.SPECTRAL) {
    const zoomFactor = DEFAULT_ZOOM_FACTOR[telescope];
    const zoomChannels = subarrayCapabilities(osd, telescope, subarray)?.numberZoomChannels ?? null;
    const centralHz =
      telescope === TELESCOPE.LOW && band && centreHz !== null && zoomChannels !== null
        ? snapCentralFrequencyToChannelGridHz(
            centreHz,
            zoomChannelWidthHz(telescope, zoomFactor),
            zoomChannels,
            band.minFrequencyHz
          )
        : centreHz;
    return {
      centralFrequency: mhz(centralHz),
      bandwidth: spectralBandwidth(telescope, zoomFactor, zoomChannels, 'MHz'),
      zoomFactor,
      zoomChannels
    };
  }
  return {
    centralFrequency: mhz(centreHz),
    bandwidth: mhz(widestBandwidthHz(telescope, observingBand, subarray, osd))
  };
};

// The fields of an observing mode other than the frequencies
const modeDefaults = (observingMode: ObservingMode) =>
  observingMode === OBSERVING_MODE.PST
    ? { observingMode, pstMode: PstMode.PulsarTiming }
    : { observingMode };

/** A new observation in a band, with the defaults of its telescope, band, subarray and mode. */
export const newObservation = (
  observingBand: ObservingBand,
  subarray: Subarray,
  observingMode: ObservingMode,
  osd: ObservationOsd
): ObservationInput => {
  const telescope = telescopeOfBand(observingBand);
  return {
    id: generateObsSetId(),
    groupId: null,
    observingBand,
    subarray,
    ...telescopeDefaults(telescope, osd),
    ...arrayDefaults(telescope, subarray, osd),
    ...modeDefaults(observingMode),
    ...frequencyDefaults(telescope, observingBand, subarray, observingMode, osd)
  } as ObservationInput;
};

/**
 * The observation in another band. Its frequencies start again from the band's defaults. On
 * another telescope, everything that depends on the telescope does too; the subarray, mode,
 * identifier and group are kept.
 */
export const observationForBand = (
  observation: ObservationInput,
  observingBand: ObservingBand,
  osd: ObservationOsd
): ObservationInput => {
  const telescope = telescopeOfBand(observingBand);
  if (telescope !== observation.telescope) {
    return {
      ...newObservation(
        observingBand,
        observation.subarray ?? SA_AA2,
        observation.observingMode,
        osd
      ),
      id: observation.id,
      groupId: observation.groupId,
      // A null subarray stays missing, so the user sees it needs choosing
      subarray: observation.subarray
    } as ObservationInput;
  }
  return {
    ...observation,
    observingBand,
    ...frequencyDefaults(
      telescope,
      observingBand,
      observation.subarray,
      observation.observingMode,
      osd
    )
  } as ObservationInput;
};

/**
 * The observation with another subarray. A subarray in the OSD sets the stations or antennas,
 * and the number of zoom channels is reduced to what the subarray has. The rest is kept, and shows
 * an error if the subarray doesn't allow it.
 */
export const observationForSubarray = (
  observation: ObservationInput,
  subarray: Subarray,
  osd: ObservationOsd
): ObservationInput => {
  const maxZoomChannels = subarrayCapabilities(
    osd,
    observation.telescope,
    subarray
  )?.numberZoomChannels;
  return {
    ...observation,
    subarray,
    ...(subarray !== SA_CUSTOM && arrayDefaults(observation.telescope, subarray, osd)),
    ...(observation.observingMode === OBSERVING_MODE.SPECTRAL &&
      maxZoomChannels !== undefined &&
      observation.zoomChannels !== null &&
      observation.zoomChannels > maxZoomChannels && {
        zoomChannels: maxZoomChannels,
        bandwidth: spectralBandwidth(
          observation.telescope,
          observation.zoomFactor,
          maxZoomChannels,
          observation.bandwidth.unit ?? 'MHz'
        )
      })
  } as ObservationInput;
};

/**
 * The observation in another observing mode. The fields all modes have are kept, and so is a
 * bandwidth of its own between the modes that have one. A spectral line observation starts with
 * the coarsest zoom factor and all the zoom channels, and a PST one with pulsar timing.
 */
export const observationForMode = (
  observation: ObservationInput,
  observingMode: ObservingMode,
  osd: ObservationOsd
): ObservationInput => {
  // The fields of the current mode go, and the new mode's come in their place
  const {
    observingMode: _mode,
    bandwidth,
    zoomFactor: _zoomFactor,
    zoomChannels: _zoomChannels,
    pstMode: _pstMode,
    ...shared
  } = observation as ObservationInput & {
    bandwidth?: ObservationInput['centralFrequency'];
    zoomFactor?: unknown;
    zoomChannels?: unknown;
    pstMode?: unknown;
  };
  const defaults = frequencyDefaults(
    observation.telescope,
    observation.observingBand,
    observation.subarray,
    observingMode,
    osd
  );
  return {
    ...shared,
    ...modeDefaults(observingMode),
    ...(observingMode === OBSERVING_MODE.SPECTRAL
      ? {
          bandwidth: defaults.bandwidth,
          zoomFactor: defaults.zoomFactor,
          zoomChannels: defaults.zoomChannels
        }
      : {
          // A spectral line bandwidth is that of its channels, so the new mode starts from its
          // default
          bandwidth:
            observation.observingMode !== OBSERVING_MODE.SPECTRAL && bandwidth
              ? bandwidth
              : defaults.bandwidth
        })
  } as ObservationInput;
};
