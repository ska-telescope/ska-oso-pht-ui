import { scaleBandwidthOrFrequency } from '@components/fields/bandwidthFields/bandwidthValidationCommon.tsx';
import {
  FREQUENCY_HZ,
  FREQUENCY_UNITS,
  SPEED_OF_LIGHT,
  TEXT_ENTRY_PARAMS,
  VELOCITY_UNITS,
  DEFAULT_PST_OBSERVATION_LOW,
  DEFAULT_ZOOM_OBSERVATION_LOW,
  TYPE_ZOOM,
  TYPE_PST,
  TYPE_CONTINUUM_SPECTRAL,
  DEFAULT_CONTINUUM_OBSERVATION_LOW,
  TIME_UNITS,
  FREQUENCY_STR_KHZ,
  FREQUENCY_STR_MHZ,
  FREQUENCY_STR_HZ,
  TELESCOPE_LOW_NUM
} from './constants';
import Observation from './types/observation';
import { ValueUnitPair } from './types/valueUnitPair';
import { OSD_CONSTANTS } from './OSDConstants';
import { channelsToBandwidthHz } from '@utils/zoomWindow.ts';
import { Telescope } from '@ska-telescope/ska-gui-local-storage';
import { TELESCOPE_LOW, TELESCOPE_MID } from '@ska-telescope/ska-gui-components';

export const arraysAreEqual = (a: any[], b: any[]) => {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
};

export const generateObsSetId = () => generateId('obs-set-');
export const generateDataProductId = () => generateId('data-product-');
export const generateTargetId = () => generateId('target-');
export const generateCalibrationId = () => generateId('calibration-');

export const generateId = (prefix: string, length: number = 8) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return prefix + result;
};

export const getBandwidthOrFrequencyUnitsLabel = (incValue: number): string => {
  return FREQUENCY_UNITS.find((item) => item.value === incValue)?.label as string;
};

export const getScaledBandwidthOrFrequency = (
  incValue: number | undefined,
  inUnits: number | undefined
) => {
  const unitsLabel = getBandwidthOrFrequencyUnitsLabel(inUnits ?? FREQUENCY_HZ);
  return scaleBandwidthOrFrequency(incValue ?? 0, unitsLabel);
};

export const countWords = (text: string) => {
  return !text ? 0 : text.trim().split(/\s+/).filter(Boolean).length;
};

export const frequencyConversion = (inValue: any, from: number, to: number = FREQUENCY_HZ) => {
  return (inValue * FREQUENCY_UNITS[to - 1].toHz) / FREQUENCY_UNITS[from - 1].toHz;
};

export const isFrequencyRangeOutOfBand = (
  centralFrequency: number,
  bandwidth: number,
  minFreq: number,
  maxFreq: number
): boolean => {
  if (minFreq === 0 && maxFreq === 0) return false;
  return centralFrequency < minFreq + bandwidth / 2 || centralFrequency > maxFreq - bandwidth / 2;
};

export const calculateVelocity = (resolutionHz: number, frequencyHz: number, precision = 1) => {
  const velocity = frequencyHz > 0 ? (resolutionHz / frequencyHz) * SPEED_OF_LIGHT : 0;
  const occ = velocity < 1000 ? 0 : 1;
  return (
    (velocity / VELOCITY_UNITS[occ].convert).toFixed(precision) + ' ' + VELOCITY_UNITS[occ].label
  );
};

export const helpers = {
  validate: {
    validateTextEntry(
      text: string,
      setText: Function,
      setErrorText: Function,
      textType?: keyof typeof TEXT_ENTRY_PARAMS
    ): boolean {
      textType = textType ?? 'DEFAULT';
      const textEntryParams = TEXT_ENTRY_PARAMS[textType];
      if (!textEntryParams) {
        // handle invalid textType (no match in TEXT_ENTRY_PARAMS)
        throw new Error(`Invalid text type: ${textType}`);
      }
      const { ERROR_TEXT, PATTERN } = textEntryParams;
      if (PATTERN.test(text)) {
        setText(text);
        setErrorText('');
        return true;
      }
      setErrorText(ERROR_TEXT);
      return false;
    }
  },
  transform: {
    // trim undefined and empty properties of an object
    trimObject(obj: any): any {
      if (Array.isArray(obj)) {
        // Recursively trim each element, then filter out null/undefined/empty string
        return obj
          .map((item) => this.trimObject(item))
          .filter((item) => item !== undefined && item !== null && item !== '');
      } else if (obj && typeof obj === 'object') {
        const newObj: any = {};
        Object.keys(obj).forEach((key) => {
          const value = obj[key];
          if (value === undefined || value === '' || value === null) {
            if (
              key === 'submitted_by' ||
              key === 'submitted_on' ||
              key === 'abstract' ||
              key === 'reason' ||
              key === 'srcNet' ||
              key === 'calibrators'
            ) {
              // keep these keys even if null/empty
              newObj[key] = value;
            }
            // else skip the key entirely
          } else if (typeof value === 'object') {
            newObj[key] = this.trimObject(value);
          } else {
            newObj[key] = value;
          }
        });
        return newObj;
      }
      return obj;
    }
  }
};

/*********************************************************** filter *********************************************************/

const sortByLastUpdated = (array: any[]): any[] => {
  array.sort(function (a, b) {
    return (
      new Date(b.metadata?.last_modified_on as string)?.valueOf() -
      new Date(a.metadata?.last_modified_on as string)?.valueOf()
    );
  });
  return array;
};

const groupBylId = (data: any[], idKey: string) => {
  return data.reduce(
    (grouped: { [key: string]: any[] }, obj) => {
      if (!grouped[obj[idKey]]) {
        grouped[obj[idKey]] = [obj];
      } else {
        grouped[obj[idKey]].push(obj);
      }
      return grouped;
    },
    {} as { [key: string]: any[] }
  );
};

export const getUniqueMostRecentItems = (data: any[], idKey: string) => {
  // retrieve unique items based on idKey
  const grouped: { [key: string]: any[] } = groupBylId(data, idKey);

  // sort each group by last_modified_on and take the most recent item
  const sorted = (Object as any).values(grouped).map((arr: any[]) => {
    sortByLastUpdated(arr);
    return arr[0];
  });

  // Final global sort by last_modified_on
  return sortByLastUpdated(sorted);
};

export const leadZero = (coordinate: string): string => {
  const normalised = coordinate.toString().replace(/^\+/, '');
  const arr = normalised.split(':');
  const num = Number(arr[0]);
  if (arr?.length === 3 && num > -1 && num < 10 && arr[0]?.length < 2) {
    return '0' + arr[0] + ':' + arr[1] + ':' + arr[2];
  } else if (arr?.length === 3 && num > -10 && num < 0 && arr[0].length < 3) {
    return '-0' + Math.abs(Number(arr[0])) + ':' + arr[1] + ':' + arr[2];
  }
  return normalised;
};

export const trailingZeros = (coordinate: string): string => {
  const parts = coordinate.split(':');
  if (parts.length !== 3) return coordinate;
  const dotIndex = parts[2].indexOf('.');
  if (dotIndex === -1) {
    parts[2] = parts[2] + '.000';
  } else {
    const fracPart = parts[2].substring(dotIndex + 1);
    parts[2] = parts[2].substring(0, dotIndex + 1) + fracPart.padEnd(3, '0');
  }
  return parts.join(':');
};

/*********************************************************** map values *********************************************************/

/**
 * Parses the string stored like 1808.45 Hz (2.7 km/s) into the frequency numeric value in Hz
 **/
export const getSpectralResolutionHz = (observation: Observation | null | undefined): number => {
  if (!observation?.spectralResolution) return 0;
  const units = FREQUENCY_UNITS[2].label;
  return observation.spectralResolution.includes(units)
    ? Number(observation.spectralResolution.split(' ')[0]) * 1000
    : Number(observation.spectralResolution.split(' ')[0]);
};

/**
 * The bandwidth in the zoom mode can be derived from the spectral resolution (i.e. the channel
 * width) and the number of channels.
 * */
export const getBandwidthZoom = (incObs: Observation | null | undefined): ValueUnitPair => {
  if (!incObs?.zoomChannels) {
    return { value: 0, unit: FREQUENCY_STR_MHZ };
  }
  const spectralResHz = getSpectralResolutionHz(incObs);
  if (spectralResHz === 0) {
    return { value: 0, unit: FREQUENCY_STR_MHZ };
  }
  const value = channelsToBandwidthHz(incObs.zoomChannels, spectralResHz);
  return {
    value: value * 1e-6,
    unit: FREQUENCY_STR_MHZ
  };
};

export const getBandwidthLowZoom = (inValue: number) => {
  const obsTelescopeArray = OSD_CONSTANTS.array[1];
  return obsTelescopeArray?.bandWidth?.find((b) => b.value === inValue);
};

/**
 * Maps the cbfModes to the Observing Modes available.
 */
export const obTypeTransform = (inData: string[]) => {
  const out: string[] = [];
  inData.forEach((item) => {
    if (item === 'vis' || item === 'correlation') {
      out.push('continuum', 'spectral', TYPE_CONTINUUM_SPECTRAL);
    } else if (item === 'pst') {
      out.push('pst');
    }
    // everything else is ignored
  });

  return out;
};

/**
 * Returns the default LOW AA2 observation for the given observing mode, falling back to the
 * continuum default for combined or unrecognised modes.
 */
export const getDefaultObservationLowAA2 = (type: string): Observation => {
  switch (type) {
    case TYPE_ZOOM:
      return DEFAULT_ZOOM_OBSERVATION_LOW;
    case TYPE_PST:
      return DEFAULT_PST_OBSERVATION_LOW;
    case TYPE_CONTINUUM_SPECTRAL:
    default:
      return DEFAULT_CONTINUUM_OBSERVATION_LOW;
  }
};

export const timeConversion = (inValue: number, from: number, to: number) => {
  const fromUnit = TIME_UNITS.find((u) => u.id === from);
  const toUnit = TIME_UNITS.find((u) => u.id === to);
  if (!fromUnit || !toUnit) return inValue;
  return (inValue * toUnit.toDay) / fromUnit.toDay;
};

/**
 * TODO - this is a limited first implementation. It should be made to support all orders of magnitude.
 **/
export const convertFrequencyToDisplayUnits = (
  value: number,
  unit: string
): { value: number; unit: string } => {
  if (unit !== FREQUENCY_STR_KHZ) {
    throw Error('Function not currently supported for input unit');
  }

  if (value >= 1e3) {
    return { value: value / 1e3, unit: FREQUENCY_STR_MHZ };
  }

  if (value < 1) {
    return { value: value * 1e3, unit: FREQUENCY_STR_HZ };
  }

  return { value, unit };
};

export const getTelescope = (telNum: number): Telescope =>
  telNum === TELESCOPE_LOW_NUM ? TELESCOPE_LOW : TELESCOPE_MID;
