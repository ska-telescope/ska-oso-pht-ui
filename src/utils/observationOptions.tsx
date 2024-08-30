import { OBSERVATION } from './constants';

export const subArrayOptions = (inObj: { telescope: number; isBand5: any }) => {
  if (!inObj) {
    return [];
  }
  let results = OBSERVATION.array[inObj.telescope - 1]?.subarray;
  if (inObj.isBand5) results = results.filter(e => !e.disableForBand5);
  return results;
};
