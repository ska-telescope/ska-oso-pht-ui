import { useTranslation } from 'react-i18next';
import { isCypress } from '@/utils/constants';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';

const isDev = process.env.NODE_ENV === 'development';

export const useScopedTranslation = (namespaces?: string[]) => {
  const { isSV } = useOSDAccessors();

  const defaultNamespaces = !isCypress && isSV ? ['sv', 'pht'] : ['pht'];
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
