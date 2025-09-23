import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import ObservatoryData from '@utils/types/observatoryData.tsx';

const { application} = storageObject.useStore();

const getObservatoryData = () => application.content3 as ObservatoryData;

export const subArrayOptions = (inObj: { telescope: number; isBand5: any }) => {
  if (!inObj) {
    return [];
  }
  return getObservatoryData().constantData?.array[inObj.telescope - 1]?.subarray;
};
