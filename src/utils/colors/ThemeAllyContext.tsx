// ThemeA11yContext.tsx
import React, { createContext, use, useEffect, useMemo, useState } from 'react';
import { ThemeA11ySettings } from '@utils/types/colors';
import { loadThemeA11y, saveThemeA11y } from '@utils/storage/storage';
import { STORAGE_KEYS } from '@utils/storage/storageKeys';

type ThemeA11yContextValue = {
  settings: ThemeA11ySettings;
  setSettings: (next: ThemeA11ySettings) => void;
};

const ThemeA11yContext = createContext<ThemeA11yContextValue | undefined>(undefined);

export const ThemeA11yProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ThemeA11ySettings>(() => loadThemeA11y());

  const persistSettings = (next: ThemeA11ySettings) => {
    setSettings(next);
    saveThemeA11y(next);
  };

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.themeA11y && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as ThemeA11ySettings;
          if (parsed.version === 1) setSettings(parsed);
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo(() => ({ settings, setSettings: persistSettings }), [settings]);
  return <ThemeA11yContext value={value}>{children}</ThemeA11yContext>;
};

export const useThemeA11y = () => {
  const ctx = use(ThemeA11yContext);
  if (!ctx) throw new Error('useThemeA11y must be used within ThemeA11yProvider');
  return ctx;
};
