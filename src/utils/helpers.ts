import { scaleBandwidthOrFrequency } from '@components/fields/bandwidthFields/bandwidthValidationCommon.tsx';
import {
  FREQUENCY_HZ,
  FREQUENCY_UNITS,
  SPEED_OF_LIGHT,
  TEXT_ENTRY_PARAMS,
  VELOCITY_UNITS,
  BANDWIDTH_MIN_CHANNEL_WIDTH_HZ
} from './constants';
import Observation from './types/observation';
import { ValueUnitPair } from './types/valueUnitPair';
import { OSD_CONSTANTS } from './OSDConstants';

// TODO : Ensure that we remove all hard-coded values

export const arraysAreEqual = (a: any[], b: any[]) => {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
};

export const generateId = (prefix: string, length: number = 8) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return prefix + result;
};

export const getBandwidthOrFrequencyUnitsLabel = (incValue: number): string => {
  return FREQUENCY_UNITS.find(item => item.value === incValue)?.label as string;
};

export const getScaledBandwidthOrFrequency = (
  incValue: number | undefined,
  inUnits: number | undefined
) => {
  const unitsLabel = getBandwidthOrFrequencyUnitsLabel(inUnits ?? FREQUENCY_HZ);
  return scaleBandwidthOrFrequency(incValue ?? 0, unitsLabel);
};

export const countWords = (text: string) => {
  return !text
    ? 0
    : text
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
};

// TODO double-check function and/or multipliers
export const frequencyConversion = (inValue: any, from: number, to: number = FREQUENCY_HZ) => {
  return (inValue * FREQUENCY_UNITS[to - 1].toHz) / FREQUENCY_UNITS[from - 1].toHz;
};

export const calculateVelocity = (resolutionHz: number, frequencyHz: number, precision = 1) => {
  const velocity = frequencyHz > 0 ? (resolutionHz / frequencyHz) * SPEED_OF_LIGHT : 0;
  const occ = velocity < 1000 ? 0 : 1;
  return (
    (velocity / VELOCITY_UNITS[occ].convert).toFixed(precision) + ' ' + VELOCITY_UNITS[occ].label
  );
};

// fundamental limit of the bandwidth provided by SKA MID or LOW
export const getMinimumChannelWidth = (telescope: number): number =>
  BANDWIDTH_MIN_CHANNEL_WIDTH_HZ[telescope as keyof typeof BANDWIDTH_MIN_CHANNEL_WIDTH_HZ];

export const helpers = {
  validate: {
    validateTextEntry(
      text: string,
      setText: Function,
      setErrorText: Function,
      textType?: keyof typeof TEXT_ENTRY_PARAMS
    ): boolean {
      // eslint-disable-next-line react-hooks/rules-of-hooks
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
          .map(item => this.trimObject(item))
          .filter(item => item !== undefined && item !== null && item !== '');
      } else if (obj && typeof obj === 'object') {
        const newObj: any = {};
        Object.keys(obj).forEach(key => {
          const value = obj[key];
          if (value === undefined || value === '' || value === null) {
            if (
              key === 'submitted_by' ||
              key === 'submitted_on' ||
              key === 'abstract' ||
              key === 'reason' ||
              key === 'srcNet' ||
              key === 'tied_array_beams' ||
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
  array.sort(function(a, b) {
    return (
      new Date(b.metadata?.last_modified_on as string)?.valueOf() -
      new Date(a.metadata?.last_modified_on as string)?.valueOf()
    );
  });
  return array;
};

const groupBylId = (data: any[], idKey: string) => {
  return data.reduce((grouped: { [key: string]: any[] }, obj) => {
    if (!grouped[obj[idKey]]) {
      grouped[obj[idKey]] = [obj];
    } else {
      grouped[obj[idKey]].push(obj);
    }
    return grouped;
  }, {} as { [key: string]: any[] });
};

export const getUniqueMostRecentItems = (data: any[], idKey: string) => {
  // retrieve unique items based on idKey
  let grouped: { [key: string]: any[] } = groupBylId(data, idKey);

  // sort each group by last_modified_on and take the most recent item
  let sorted = (Object as any).values(grouped).map((arr: any[]) => {
    sortByLastUpdated(arr);
    return arr[0];
  });

  // Final global sort by last_modified_on
  return sortByLastUpdated(sorted);
};

export const leadZero = (coordinate: String): String => {
  const arr = coordinate.split(':');
  const num = Number(arr[0]);
  if (arr?.length === 3 && num > -1 && num < 10 && arr[0]?.length < 2) {
    return '0' + arr[0] + ':' + arr[1] + ':' + arr[2];
  } else if (arr?.length === 3 && num > -10 && num < 0 && arr[0].length < 3) {
    return '-0' + Math.abs(Number(arr[0])) + ':' + arr[1] + ':' + arr[2];
  }
  return coordinate;
};

/*********************************************************** map values *********************************************************/

export const getBandwidthZoom = (incObs: Observation): ValueUnitPair => {
  const obsTelescopeArray = OSD_CONSTANTS.array.find(o => o.value === incObs.telescope);
  const bandwidth = obsTelescopeArray?.bandWidth?.find(b => b.value === incObs.bandwidth);
  const valueUnit = bandwidth?.label?.split(' ');
  const value = valueUnit && valueUnit.length > 0 ? Number(valueUnit[0]) : 0;
  return {
    value: value,
    unit: bandwidth?.mapping ? bandwidth.mapping : ''
  };
};
