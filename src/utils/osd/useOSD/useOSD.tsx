import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import ObservatoryData from '@/utils/types/observatoryData';

export function useOSD(): ObservatoryData {
  const { application } = storageObject.useStore();
  return application.content3 as ObservatoryData;
}
