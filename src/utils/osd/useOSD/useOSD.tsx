import { storageObject } from '@utils/storage/store';
import ObservatoryData from '@/utils/types/observatoryData';

export function useOSD(): ObservatoryData {
  const { application } = storageObject.useStore();
  return application.content3 as ObservatoryData;
}
