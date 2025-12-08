// GetColorsContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { GetColorsSettings } from '@utils/types/colors';
import { loadGetColors, saveGetColors } from '@utils/storage/storage';
import { STORAGE_KEYS } from '@utils/storage/storageKeys';

type GetColorsContextValue = {
  settings: GetColorsSettings;
  setSettings: (next: GetColorsSettings) => void;
};

const Ctx = createContext<GetColorsContextValue | undefined>(undefined);

export const GetColorsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<GetColorsSettings>(() => loadGetColors());

  const setSettings = (next: GetColorsSettings) => {
    setSettingsState(next);
    saveGetColors(next);
  };

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.appColors && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as GetColorsSettings;
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

export const useGetColors = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGetColors must be used within GetColorsProvider');
  return ctx;
};
