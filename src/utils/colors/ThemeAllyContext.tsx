// ThemeA11yContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeA11ySettings } from '@utils/types/colors';
import { loadThemeA11y, saveThemeA11y } from '@utils/storage/storage';
import { STORAGE_KEYS } from '@utils/storage/storageKeys';

type ThemeA11yContextValue = {
  settings: ThemeA11ySettings;
  setSettings: (next: ThemeA11ySettings) => void;
};

const Ctx = createContext<ThemeA11yContextValue | undefined>(undefined);

export const ThemeA11yProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<ThemeA11ySettings>(() => loadThemeA11y());

  const setSettings = (next: ThemeA11ySettings) => {
    setSettingsState(next);
    saveThemeA11y(next);
  };

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.themeA11y && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as ThemeA11ySettings;
          if (parsed.version === 1) setSettingsState(parsed);
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo(() => ({ settings, setSettings }), [settings]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useThemeA11y = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useThemeA11y must be used within ThemeA11yProvider');
  return ctx;
};
