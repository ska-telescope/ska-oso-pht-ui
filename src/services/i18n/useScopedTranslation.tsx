import { useTranslation } from 'react-i18next';
import React from 'react';
import { isCypress } from '@/utils/constants';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';

const isDev = process.env.NODE_ENV === 'development';

export const useScopedTranslation = (namespaces?: string[]) => {
  const { isSV } = useOSDAccessors();

  const defaultNamespaces = isSV ? ['sv', 'pht'] : ['pht'];
  const { t: rawT, ...rest } = useTranslation(namespaces || defaultNamespaces);

  const t = React.useCallback(
    (key: string, options?: any) => {
      const translation = rawT(key, options);
      const isMissing = translation === key;

      if (isDev && isMissing) {
        return `🚨 ${key} 🚨`;
      }

      return translation;
    },
    [rawT] // only changes when the underlying translator changes
  );

  return { t, ...rest };
};
