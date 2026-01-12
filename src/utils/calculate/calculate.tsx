// import { BAND_1_STR, BAND_2_STR, BAND_5A_STR, BAND_5B_STR } from '../constants';

// const lookupArrayValue = (arr: any[], inValue: string | number) =>
//   arr.find(e => e.lookup.toString() === inValue.toString())?.value;

/*-----------------------------------------------------*/

export const calculateCentralFrequency = (inCap: any, sc: string) => {
  const cap = inCap.basicCapabilities;
  if (cap?.minFrequencyHz !== undefined && cap?.maxFrequencyHz !== undefined) {
    return (cap.minFrequencyHz + cap.maxFrequencyHz) / 2;
  }
  if (Array.isArray(cap?.receiverInformation)) {
    const rec = cap.receiverInformation.find((r: { rxId: string }) => r.rxId === sc);
    if (rec && rec.minFrequencyHz !== undefined && rec.maxFrequencyHz !== undefined) {
      return (rec.minFrequencyHz + rec.maxFrequencyHz) / 2;
    }
  }
  return 0;
};

export const calculateContinuumBandwidth = (cap: any, sc: string) => {
  const rec = cap.subArrays.find((s: any) => s.subArray === sc);
  return rec?.availableBandwidthHz || 0;
};
