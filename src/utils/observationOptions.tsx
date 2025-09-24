import { storageObject } from '@ska-telescope/ska-gui-local-storage';

export const subArrayOptions = (inObj: { telescope: number; isBand5: any }) => {
  const { application } = storageObject.useStore();
  const observatoryData = application.content3;
  if (!inObj) {
    return [];
  }
  return observatoryData?.constantData?.array[inObj.telescope - 1]?.subarray;
};
