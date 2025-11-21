import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

export function useHelp() {
  const { helpComponent } = storageObject.useStore();
  const { t } = useScopedTranslation();

  /**
   * Sets help text and optional URL using translation keys.
   * @param key - Base translation key (e.g. "email" or "firstName")
   */
  function setHelp(key: string) {
    // Always set help text
    helpComponent(t(`${key}.help`));

    // Only set URL if translation exists - Implement once all the pages are migrated.
    /*
    const url = t(`${key}.helpURL`);
    if (url && url !== `${key}.helpURL`) {
      helpComponentURL(url);
    } else {
      helpComponentURL('');
    }
    */
  }

  return { setHelp };
}
