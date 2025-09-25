import { OSD_CONSTANTS } from '@utils/OSDConstants.ts';

export const subArrayOptions = (inObj: { telescope: number; isBand5: any }) => {
  if (!inObj) {
    return [];
  }
  let results = OSD_CONSTANTS.array[inObj.telescope - 1]?.subarray;
  if (inObj.isBand5) results = results.filter(e => !e.disableForBand5);
  return results;
};
