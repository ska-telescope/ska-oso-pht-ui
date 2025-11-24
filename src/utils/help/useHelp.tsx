import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

export function useHelp() {
  const { helpComponent, helpComponentURL } = storageObject.useStore();
  const { t } = useScopedTranslation();

  /**
   * Sets help text and optional URL using translation keys.
   * @param key - Base translation key (e.g. "email" or "firstName" or "email.help")
   */
  function setHelp(key: string) {
    const helpKey = key.endsWith('.help') ? key : `${key}.help`;
    const helpURLKey = key.endsWith('.helpURL') ? key : `${key}.helpURL`;

    // Always set help text
    helpComponent(t(helpKey));

    function isValidUrl(str: string): boolean {
      try {
        const u = new URL(str);
        return u.protocol === 'http:' || u.protocol === 'https:';
      } catch {
        return false;
      }
    }

    const url = t(helpURLKey);
    if (url && isValidUrl(url)) {
      helpComponentURL(url);
    } else {
      helpComponentURL('');
    }
  }

  return { setHelp };
}
