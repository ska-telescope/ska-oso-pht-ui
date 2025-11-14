import { OSD_CONSTANTS } from '@utils/OSDConstants.ts';

const sensCalHelpers = {
  format: {
    convertBandwidthToMHz(bandwidthValue: number, bandwidthUnits: string): number {
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
    convertBandwidthToKHz(bandwidthValue: number, bandwidthUnits: string): number {
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
    convertBandwidthToHz(bandwidthValue: number, bandwidthUnits: string): number {
      if (typeof bandwidthUnits === 'number') {
        bandwidthUnits = OSD_CONSTANTS.Units.find(item => item.value === bandwidthUnits)?.label;
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
