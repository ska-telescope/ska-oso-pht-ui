import { storageObject } from '@ska-telescope/ska-gui-local-storage';
function getObservatoryData() {
  const { application } = storageObject.useStore();
  // Use obsData here
  return application.content3;
}

const sensCalHelpers = {
  format: {
    convertBandwidthToMHz(bandwidthValue, bandwidthUnits): number {
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
    convertBandwidthToKHz(bandwidthValue, bandwidthUnits): number {
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
    convertBandwidthToHz(bandwidthValue, bandwidthUnits): number {
      if (typeof bandwidthUnits === 'number') {
        bandwidthUnits = getObservatoryData()?.constantData?.Units.find(
          item => item.value === bandwidthUnits
        )?.label;
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
