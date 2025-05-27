export const API_VERSION = '/senscalc/api/v11';

export const ANTENNA_LOW = 'low';
export const ANTENNA_13M = '13m';
export const ANTENNA_15M = '15m';
export const ANTENNA_MIXED = 'mixed';

export const HELP_FONT = 12;
export const TOOLTIP_FONT = 12; // Size in pixels
export const TOOLTIP_PLACEMENT = 'top-start';

export const RESULT_FONT_DATA = 18;
export const RESULT_FONT_ERROR = 18;
export const RESULT_FONT_LABEL = 12;
export const RESULT_FONT_WARNING = 16;

export const TITLE_FONTSIZE = 12;

export const BAND_1 = 'mid_band_1';
export const BAND_2 = 'mid_band_2';
export const BAND_3 = 'mid_band_3';
export const BAND_4 = 'mid_band_4';
export const BAND_5A = 'mid_band_5a';
export const BAND_5B = 'mid_band_5b';

// Mixed / Ska / Meer
export const BANDWIDTH_DEFAULTS_BAND_1 = [0.435, 0.7, 0.435];
export const BANDWIDTH_DEFAULTS_BAND_2 = [0.72, 0.8, 0.81];
export const BANDWIDTH_DEFAULTS_BAND_5A = [3.9, 0.8, 3.9];
export const BANDWIDTH_DEFAULTS_BAND_5B = [5, 0.8, 5];
export const BANDWIDTH_DEFAULTS_LOW = [75, 300, 150];
export const BANDWIDTH_DEFAULTS_LOW_ZOOM = [5, 1, 1];
export const BANDWIDTH_DEFAULTS_MID_ZOOM = [1, 1, 1];
//
//stored in Hz due to conversion
export const BANDWIDTH_LIMITS_LOW = [
  [50000000, 350000000],
  [50000000, 350000000],
  [50000000, 350000000]
];
export const BANDWIDTH_LIMITS_BAND_1 = [
  [0.58e9, 1.015e9],
  [0.35e9, 1.05e9],
  [0.58e9, 1.015e9]
];
export const BANDWIDTH_LIMITS_BAND_2 = [
  [0.95e9, 1.67e9],
  [0.95e9, 1.76e9],
  [0.95e9, 1.67e9]
];
export const BANDWIDTH_LIMITS_BAND_5A = [
  [4.6e9, 8.5e9],
  [4.6e9, 8.5e9],
  [4.6e9, 8.5e9]
];
export const BANDWIDTH_LIMITS_BAND_5B = [
  [8.3e9, 15.4e9],
  [8.3e9, 15.4e9],
  [8.3e9, 15.4e9]
];

export const BANDWIDTH_LOW_ZOOM = [
  24.4140625,
  48.828125,
  97.65625,
  195.3125,
  390.625,
  781.25,
  1562.5,
  3125.0
];
export const BANDWIDTH_MID_ZOOM = [3.125, 6.25, 12.5, 25.0, 50.0, 100.0, 200.0];

export const MOCKED_API = false; // Set to false for live API calls
export const MOCKED_API_PSS = false; // Set to false for live API calls
export const MOCKED_API_SA = false; // Set to false for live API calls

export const STARGAZER = false; // Set to true to enable hidden fields

export const AXIOS_CONFIG = {
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
};

export const STATUS_OK = 0;
export const STATUS_ERROR = 1;
export const STATUS_ERROR_SYMBOL = '!';
export const STATUS_PARTIAL = 3;
export const STATUS_INITIAL = 5;
export const STATUS = {
  OK: STATUS_OK,
  ERROR: STATUS_ERROR,
  PARTIAL: STATUS_PARTIAL,
  INITIAL: STATUS_INITIAL
};

export const TELESCOPE_MID_NUM = 1;
export const TELESCOPE_LOW_NUM = 2;
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

// Mixed / Ska / Meer
export const FREQUENCY_DEFAULTS_BAND_1 = [0.7975, 0.7, 0.7975];
export const FREQUENCY_DEFAULTS_BAND_2 = [1.31, 1.355, 1.355];
export const FREQUENCY_DEFAULTS_BAND_5A = [6.55, 6.55, 55, 6, 55];
export const FREQUENCY_DEFAULTS_BAND_5B = [11.85, 11.85, 11.85];
export const FREQUENCY_DEFAULTS_LOW = [200, 200, 200];

export const PULSAR_MODE_FOLDED = 'folded_pulse';
export const PULSAR_MODE_SINGLE = 'single_pulse';
export const PULSAR_MODE = [PULSAR_MODE_FOLDED, PULSAR_MODE_SINGLE];

export const NO_TAPERING = 0;

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

export const RESULTS_WIDTH = 6;
export const FIELD_SPACING = 2;

export const SENSITIVITY_K = 5;

// For a 1 arc-second beam at a frequency of 100 GHz, 1 K of brightness temperature corresponds to roughly 1 mJy/beam.
export const SENSITIVITY_UNITS = [
  { id: 1, value: 'Jy/beam', mapping: 'Jy / beam', toBase: 1 },
  { id: 2, value: 'mJy/beam', mapping: 'mJy / beam', toBase: 1000 },
  { id: 3, value: 'uJy/beam', mapping: 'uJy / beam', toBase: 1000000 },
  { id: 4, value: 'nJy/beam', mapping: 'nJy / beam', toBase: 1000000000 },
  { id: SENSITIVITY_K, value: 'K', mapping: 'K', toBase: 1000 },
  { id: 6, value: 'mK', mapping: 'mK', toBase: 1000000 },
  { id: 7, value: 'uK', mapping: 'uK', toBase: 1000000000 }
];

export const SEPARATOR0 = '?';
export const SEPARATOR1 = '&';

export const PANEL_WIDTH = 850; // Width of the SensCalc panel
export const WRAPPER_HEIGHT = '68px'; // Standard height of a component
export const BUTTON_HEIGHT = '40px'; // Height of the Reset & Calculate buttons
export const BUTTON_FONT_SIZE = '18px'; // FontSize of the Reset & Calculate buttons
export const DECIMAL_PLACES = 2; // Decimal places for all results

export const RA_TYPE_EQUATORIAL = '0';
export const RA_TYPE_GALACTIC = '1';
export const DEFAULT_GALACTIC = '00:00:00.0';
export const DEFAULT_EQUATORIAL = 0;

export const DEFAULT_LOW_SUPPLIED_INTEGRATION_TIME = { value: 1, unit: '2' };
export const DEFAULT_LOW_SUPPLIED_SENSITIVITY = { value: 1, unit: '1' };
export const DEFAULT_MID_SUPPLIED_INTEGRATION_TIME = { value: 600, unit: '4' };
export const DEFAULT_MID_SUPPLIED_SENSITIVITY = { value: 1, unit: '1' };

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
export const SUBARRAY_TYPE_MIXED = 0;
export const SUBARRAY_TYPE_SKA = 1;
export const SUBARRAY_TYPE_MEER = 2;

export const SPEED_OF_LIGHT = 299792458; // m/s

export const TYPE_ZOOM = 0;
export const TYPE_CONTINUUM = 1;
export const TYPE_PSS = 2;

export const USE_LOCAL_DATA = true;

export const VELOCITY_M_S = 0;
export const VELOCITY_KM_S = 1;
export const VELOCITY_UNITS = [
  { value: VELOCITY_M_S, mapping: 'm/s', toMS: 1 },
  { value: VELOCITY_KM_S, mapping: 'km/s', toMS: 1000 }
];

export const MIN_CHANNEL_LOW_HZ = (24 * 781.25e3) / 3456;
export const MIN_CHANNEL_MID_HZ = 13.44e3;

export const BANDWIDTH_MIN_LOW = 14.5;
export const BANDWIDTH_MAX_LOW = 118.52;
export const BANDWIDTH_MAX_MID = 300;

export const DEPLOYMENT_TIMELINE = ['AA0.5', 'AA1', 'AA2', 'AA*', 'AA4'];
