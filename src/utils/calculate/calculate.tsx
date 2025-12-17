import { BAND_1_STR, BAND_2_STR, BAND_5A_STR, BAND_5B_STR } from '../constants';

const lookupArrayValue = (arr: any[], inValue: string | number) =>
  arr.find(e => e.lookup.toString() === inValue.toString())?.value;

/*-----------------------------------------------------*/

export const calculateCentralFrequency = (obsBand: string, subarrayConfig: number, osd: any) => {
  switch (obsBand) {
    case BAND_1_STR:
      return lookupArrayValue(osd.CentralFrequencyOB1, subarrayConfig);
    case BAND_2_STR:
      return lookupArrayValue(osd.CentralFrequencyOB2, subarrayConfig);
    case BAND_5A_STR:
      return osd.CentralFrequencyOB5a[0].value;
    case BAND_5B_STR:
      return osd.CentralFrequencyOB5b[0].value;
    default:
      return osd.CentralFrequencyOBLow[0].value;
  }
};

export const calculateContinuumBandwidth = (ob: string, sc: number, osd: any) => {
  switch (ob) {
    case BAND_1_STR:
      return lookupArrayValue(osd.ContinuumBandwidthOB1, sc);
    case BAND_2_STR:
      return lookupArrayValue(osd.ContinuumBandwidthOB2, sc);
    case BAND_5A_STR:
      return lookupArrayValue(osd.ContinuumBandwidthOB5a, sc);
    case BAND_5B_STR:
      return lookupArrayValue(osd.ContinuumBandwidthOB5b, sc);
    default:
      return lookupArrayValue(osd.ContinuumBandwidthOBLow, sc);
  }
};
