// GetColorsContext.tsx
import React, { createContext, use, useEffect, useMemo, useState } from 'react';
import { GetColorsSettings } from '@utils/types/colors';
import { loadGetColors, saveGetColors } from '@utils/storage/storage';
import { STORAGE_KEYS } from '@utils/storage/storageKeys';

type GetColorsContextValue = {
  settings: GetColorsSettings;
  setSettings: (next: GetColorsSettings) => void;
};

const GetColorsContext = createContext<GetColorsContextValue | undefined>(undefined);

export const GetColorsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<GetColorsSettings>(() => loadGetColors());

  const persistSettings = (next: GetColorsSettings) => {
    setSettings(next);
    saveGetColors(next);
  };

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.appColors && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as GetColorsSettings;
          if (parsed.version === 1) setSettings(parsed);
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo(() => ({ settings, setSettings: persistSettings }), [settings]);
  return <GetColorsContext value={value}>{children}</GetColorsContext>;
};

export const useGetColors = () => {
  const ctx = use(GetColorsContext);
  if (!ctx) throw new Error('useGetColors must be used within GetColorsProvider');
  return ctx;
};
