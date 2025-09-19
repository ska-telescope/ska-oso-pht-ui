import { OBSERVATION } from '@utils/observationConstantData.ts';

export const subArrayOptions = (inObj: { telescope: number; isBand5: any }) => {
  if (!inObj) {
    return [];
  }
  return OBSERVATION.array[inObj.telescope - 1]?.subarray;
};
