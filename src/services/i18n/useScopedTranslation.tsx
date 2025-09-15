import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { useTranslation } from 'react-i18next';
import ObservatoryData from '@/utils/types/observatoryData';

const isDev = process.env.NODE_ENV === 'development';

export const useScopedTranslation = (namespaces?: string[]) => {
  const { application } = storageObject.useStore();
  const getObservatoryData = () => application.content3 as ObservatoryData;
  const isSV = () =>
    getObservatoryData()?.observatoryPolicy?.cycleDescription === 'Science Verification';

  const defaultNamespaces = isSV() ? ['sv', 'pht'] : ['pht'];
  const { t: rawT, ...rest } = useTranslation(namespaces || defaultNamespaces);

  const t = (key: string, options?: any) => {
    const translation = rawT(key, options);
    const isMissing = translation === key;

    if (isDev && isMissing) {
      return `🚨 ${key} 🚨`;
    }

    return translation;
  };

  return { t, ...rest };
};
