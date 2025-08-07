import {
  degDecToSexagesimal,
  degRaToSexagesimal,
  frequencyConversion,
  getRobustMapping,
  isGalactic,
  timeConversion
} from '@utils/helpersSensCalc.ts';
import { IW_BRIGGS, SEPARATOR1 } from '@utils/constantsSensCalc.ts';
import {
  ContinuumData,
  StandardData,
  ValueUnitPair,
  ZoomData
} from '@utils/types/typesSensCalc.tsx';

/***************/

export function addRobustProperty(data: ContinuumData | ZoomData, properties: string) {
  if (data.imageWeighting === IW_BRIGGS) {
    properties += addValue('robustness', getRobustMapping(data.robust));
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
