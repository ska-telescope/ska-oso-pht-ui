import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import ObservatoryData from '@utils/types/observatoryData.tsx';

export const subArrayOptions = (inObj: { telescope: number; isBand5: any }) => {
  const { application} = storageObject.useStore();
  const getObservatoryData = () => application.content3 as ObservatoryData;
  if (!inObj) {
    return [];
  }
  return getObservatoryData().constantData?.array[inObj.telescope - 1]?.subarray;
};
