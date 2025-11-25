import { OSD_CONSTANTS } from '@utils/OSDConstants.ts';
import { FREQUENCY_STR_HZ, FREQUENCY_STR_KHZ, FREQUENCY_STR_MHZ } from '@/utils/constants';

const sensCalHelpers = {
  format: {
    convertBandwidthToMHz(
      bandwidthValue: number,
      bandwidthUnits: string = FREQUENCY_STR_MHZ
    ): number {
      const unitMap: { [key: string]: number } = {
        GHz: 1000,
        MHz: 1,
        kHz: 0.001,
        Hz: 0.000001
      };
      if (!unitMap[bandwidthUnits]) {
        throw new Error('Invalid bandwidth unit');
      }
      return bandwidthValue * unitMap[bandwidthUnits];
    },
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
          OSD_CONSTANTS.Units.find(item => item.value === numericValue)?.label ?? FREQUENCY_STR_HZ;
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
