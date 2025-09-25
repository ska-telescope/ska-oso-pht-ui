// TODO : Put these back for implementation import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { useTranslation } from 'react-i18next';
// TODO : Put these back for implementation import ObservatoryData from '@/utils/types/observatoryData';
// TODO : Put these back for implementation import { isCypress } from '@/utils/constants';

const isDev = process.env.NODE_ENV === 'development';

export const useScopedTranslation = (namespaces?: string[]) => {
  const isSV = () => false;
  // TODO : Put these back for implementation !isCypress &&
  // TODO : Put these back for implementation osd()?.observatoryPolicy?.cycleDescription === 'Science Verification';

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
