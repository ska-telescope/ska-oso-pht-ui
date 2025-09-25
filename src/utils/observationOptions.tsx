export const subArrayOptions = (inObj: { telescope: number }, observatoryConstants) => {
  if (!inObj) {
    return [];
  }
  return observatoryConstants.array[inObj.telescope - 1]?.subarray;
};
