export const subArrayOptions = (telescope: number, observatoryConstants: any) => {
  if (!telescope) {
    return [];
  }
  return observatoryConstants.array[telescope - 1]?.subarray;
};
