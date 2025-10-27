export const STATUS_OK = 0;
export const STATUS_ERROR = 1;
export const STATUS_PARTIAL = 3;
export const STATUS_INITIAL = 5;
export const STATUS = {
  OK: STATUS_OK,
  ERROR: STATUS_ERROR,
  PARTIAL: STATUS_PARTIAL,
  INITIAL: STATUS_INITIAL
};
export const TELESCOPE_LOW_CODE = 'low';

export const FREQUENCY_GHZ = 1;
export const FREQUENCY_MHZ = 2;
export const FREQUENCY_KHZ = 3;
export const FREQUENCY_HZ = 4;
export const FREQUENCY_UNITS = [
  { id: 1, value: FREQUENCY_GHZ, mapping: 'GHz', toHz: 1 },
  { id: 2, value: FREQUENCY_MHZ, mapping: 'MHz', toHz: 1000 },
  { id: 3, value: FREQUENCY_KHZ, mapping: 'kHz', toHz: 1000000 },
  { id: 4, value: FREQUENCY_HZ, mapping: 'Hz', toHz: 1000000000 }
];

export const IW_BRIGGS = 2;
export const IW_NATURAL = 0;
export const IW_UNIFORM = 1;
export const WEIGHTING_CORRECTION_FACTOR_30_PERCENT_BANDWIDTH = '†';
export const WEIGHTING_CORRECTION_FACTOR_SINGLE_CHANNEL = '‡';

export const IMAGE_WEIGHTING = [
  { mapping: 'natural', value: IW_NATURAL },
  { mapping: 'uniform', value: IW_UNIFORM },
  { mapping: 'robust', value: IW_BRIGGS }
];

export const ROBUST = [
  { mapping: -2, label: '-2', value: 1 },
  { mapping: -1, label: '-1', value: 2 },
  { mapping: 0, label: '0', value: 3 },
  { mapping: 1, label: '1', value: 4 },
  { mapping: 2, label: '2', value: 5 }
];

export const SENSITIVITY_K = 5;

// For a 1 arc-second beam at a frequency of 100 GHz, 1 K of brightness temperature corresponds to roughly 1 mJy/beam.
export const SENSITIVITY_UNITS = [
  { id: 1, value: 'Jy/beam', mapping: 'Jy / beam', toBase: 1 },
  { id: 2, value: 'mJy/beam', mapping: 'mJy/beam', toBase: 1000 },
  { id: 3, value: 'μJy/beam', mapping: 'μJy/beam', toBase: 1000000 },
  { id: 4, value: 'nJy/beam', mapping: 'nJy / beam', toBase: 1000000000 },
  { id: SENSITIVITY_K, value: 'K', mapping: 'K', toBase: 1000 },
  { id: 6, value: 'mK', mapping: 'mK', toBase: 1000000 },
  { id: 7, value: 'uK', mapping: 'uK', toBase: 1000000000 }
];

export const SEPARATOR0 = '?';
export const SEPARATOR1 = '&';

export const WRAPPER_HEIGHT = '68px'; // Standard height of a component
export const DECIMAL_PLACES = 2; // Decimal places for all results

export const RA_TYPE_ICRS = '0'; // TODO use RA_TYPE_ICRS and RA_TYPE_GALACTIC constants from constants instead and remove this
export const RA_TYPE_GALACTIC = '1'; // TODO use RA_TYPE_ICRS and RA_TYPE_GALACTIC constants from constants instead and remove this

export const DEFAULT_LOW_SUPPLIED_INTEGRATION_TIME = { value: 1, unit: '2' };
export const DEFAULT_LOW_SUPPLIED_SENSITIVITY = { value: 1, unit: '1' };

export const TIME_DAYS = 1;
export const TIME_HOURS = 2;
export const TIME_MINS = 3;
export const TIME_SECS = 4;
export const TIME_MS = 5;
export const TIME_US = 6;
export const TIME_NS = 7;
export const TIME_UNITS = [
  { id: TIME_DAYS, value: 'd', toDay: 1 },
  { id: TIME_HOURS, value: 'h', toDay: 24 },
  { id: TIME_MINS, value: 'min', toDay: 1440 },
  { id: TIME_SECS, value: 's', toDay: 86400 },
  { id: TIME_MS, value: 'ms', toDay: 86400 * 1000 },
  { id: TIME_US, value: 'μs', toDay: 86400 * 1000000 },
  { id: TIME_NS, value: 'ns', toDay: 86400 * 1000000000 }
];

export const OB_SUBARRAY_CUSTOM = 'custom';

export const TYPE_ZOOM = 0;
export const TYPE_CONTINUUM = 1;
export const USE_LOCAL_DATA = true;
