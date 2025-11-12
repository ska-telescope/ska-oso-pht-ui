import { BAND_1, BAND_2, BAND_5A, BAND_5B } from '../constants';

const lookupArrayValue = (arr: any[], inValue: string | number) =>
  arr.find(e => e.lookup.toString() === inValue.toString())?.value;

/*-----------------------------------------------------*/

export const calculateCentralFrequency = (obsBand: number, subarrayConfig: number, osd: any) => {
  switch (obsBand) {
    case BAND_1:
      return lookupArrayValue(osd.CentralFrequencyOB1, subarrayConfig);
    case BAND_2:
      return lookupArrayValue(osd.CentralFrequencyOB2, subarrayConfig);
    case BAND_5A:
      return osd.CentralFrequencyOB5a[0].value;
    case BAND_5B:
      return osd.CentralFrequencyOB5b[0].value;
    default:
      return osd.CentralFrequencyOBLow[0].value;
  }
};

export const calculateContinuumBandwidth = (ob: number, sc: number, osd: any) => {
  switch (ob) {
    case BAND_1:
      return lookupArrayValue(osd.ContinuumBandwidthOB1, sc);
    case BAND_2:
      return lookupArrayValue(osd.ContinuumBandwidthOB2, sc);
    case BAND_5A:
      return lookupArrayValue(osd.ContinuumBandwidthOB5a, sc);
    case BAND_5B:
      return lookupArrayValue(osd.ContinuumBandwidthOB5b, sc);
    default:
      return lookupArrayValue(osd.ContinuumBandwidthOBLow, sc);
  }
};
