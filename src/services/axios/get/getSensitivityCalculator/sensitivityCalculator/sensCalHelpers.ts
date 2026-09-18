import { OSD_CONSTANTS } from '@utils/OSDConstants.ts';
import { FREQUENCY_STR_HZ, FREQUENCY_STR_KHZ } from '@/utils/constants';
import { StandardData } from '@utils/types/typesSensCalc.tsx';
import { degDecToSexagesimal, degRaToSexagesimal, isGalactic } from '@utils/helpersSensCalc.ts';

// TODO: We should refactor the code so that these are no longer needed. We already have a conversion function
//  'frequencyConversion' in utils/helpers.ts that we should use instead.

export type SensCalcQueryParams = Record<string, string | number>;

export const getPointingCentre = (standardData: StandardData): string => {
  if (isGalactic(standardData?.skyDirectionType)) {
    return `${standardData?.raGalactic?.value} ${standardData?.decGalactic?.value}`;
  }

  return `${degRaToSexagesimal(String(standardData?.raEquatorial?.value))} ${degDecToSexagesimal(String(standardData?.decEquatorial?.value))}`;
};

export const getRxBandValue = (inValue: string): string => {
  switch (inValue) {
    case 'Band_1':
    case 'mid_band_1':
      return 'Band 1';
    case 'Band_2':
    case 'mid_band_2':
      return 'Band 2';
    case 'Band_3':
    case 'mid_band_3':
      return 'Band 3';
    case 'Band_4':
    case 'mid_band_4':
      return 'Band 4';
    case 'Band_5a':
    case 'mid_band_5a':
      return 'Band 5a';
    case 'Band_5b':
    case 'mid_band_5b':
      return 'Band 5b';
    default:
      return '?????';
  }
};

const sensCalHelpers = {
  format: {
    convertBandwidthToKHz(
      bandwidthValue: number,
      bandwidthUnits: string = FREQUENCY_STR_KHZ
    ): number {
      const unitMap: { [key: string]: number } = {
        GHz: 1000000,
        MHz: 1000,
        kHz: 1,
        Hz: 0.001
      };
      if (!unitMap[bandwidthUnits]) {
        throw new Error('Invalid bandwidth unit');
      }
      return bandwidthValue * unitMap[bandwidthUnits];
    },
    convertBandwidthToHz(
      bandwidthValue: number,
      bandwidthUnits: string | number = FREQUENCY_STR_HZ
    ): number {
      if (typeof bandwidthUnits === 'number') {
        const numericValue = bandwidthUnits;
        bandwidthUnits =
          OSD_CONSTANTS.Units.find((item) => item.value === numericValue)?.label ??
          FREQUENCY_STR_HZ;
      }
      const unitMap: { [key: string]: number } = {
        GHz: 1000000000,
        MHz: 1000000,
        kHz: 1000,
        Hz: 1
      };
      if (!unitMap[bandwidthUnits]) {
        throw new Error('Invalid bandwidth unit');
      }
      return bandwidthValue * unitMap[bandwidthUnits];
    }
  }
};

export default sensCalHelpers;
