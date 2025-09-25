import { OSD_CONSTANTS } from '@utils/OSDConstants.ts';

export const subArrayOptions = (inObj: { telescope: number }) => {
  if (!inObj) {
    return [];
  }
  return OSD_CONSTANTS.array[inObj.telescope - 1]?.subarray;
};
