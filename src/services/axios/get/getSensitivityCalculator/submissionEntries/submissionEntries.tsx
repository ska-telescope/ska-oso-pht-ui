import {
  degDecToSexagesimal,
  degRaToSexagesimal,
  isGalactic,
  timeConversion
} from '@utils/helpersSensCalc.ts';
import { IW_BRIGGS, SEPARATOR1 } from '@utils/constants';
import {
  ContinuumData,
  StandardData,
  ValueUnitPair,
  ZoomData
} from '@utils/types/typesSensCalc.tsx';
import { frequencyConversion } from '@/utils/helpers';

/***************/

export function addRobustProperty(data: ContinuumData | ZoomData, properties: string) {
  if (data.imageWeighting === IW_BRIGGS) {
    properties += addValue('robustness', data.robust);
  }
  return properties;
}

/***************/

export const addFrequency = (
  label: string,
  inPair: ValueUnitPair,
  conversion: number,
  prefix: string = SEPARATOR1
) => {
  return (
    prefix + label + '=' + frequencyConversion(inPair?.value, Number(inPair?.unit), conversion)
  );
};

export const addTime = (
  label: string,
  inPair: ValueUnitPair,
  conversion: number,
  prefix: string = SEPARATOR1
) => {
  return prefix + label + '=' + timeConversion(inPair?.value, Number(inPair?.unit), conversion);
};

export const addValue = (label: string, value: any, prefix: string = SEPARATOR1) => {
  return prefix + label + '=' + value;
};

export const pointingCentre = (standardData: StandardData, prefix: string = SEPARATOR1) => {
  if (isGalactic(standardData?.skyDirectionType)) {
    return (
      prefix +
      'pointing_centre=' +
      standardData?.raGalactic?.value +
      ' ' +
      standardData?.decGalactic?.value
    );
  } else {
    return (
      prefix +
      'pointing_centre=' +
      degRaToSexagesimal(String(standardData?.raEquatorial?.value)) +
      ' ' +
      degDecToSexagesimal(String(standardData?.decEquatorial?.value))
    );
  }
};

export const rxBand = (inValue: string, prefix: string = SEPARATOR1) => {
  switch (inValue) {
    // From the OSD
    case 'Band_1':
      return prefix + 'rx_band=Band 1';
    case 'Band_2':
      return prefix + 'rx_band=Band 2';
    case 'Band_3':
      return prefix + 'rx_band=Band 3';
    case 'Band_4':
      return prefix + 'rx_band=Band 4';
    case 'Band_5a':
      return prefix + 'rx_band=Band 5a';
    case 'Band_5b':
      return prefix + 'rx_band=Band 5b';
    // Existing way
    case 'mid_band_1':
      return prefix + 'rx_band=Band 1';
    case 'mid_band_2':
      return prefix + 'rx_band=Band 2';
    case 'mid_band_3':
      return prefix + 'rx_band=Band 3';
    case 'mid_band_4':
      return prefix + 'rx_band=Band 4';
    case 'mid_band_5a':
      return prefix + 'rx_band=Band 5a';
    case 'mid_band_5b':
      return prefix + 'rx_band=Band 5b';
    default:
      return prefix + 'rx_band=?????';
  }
};
