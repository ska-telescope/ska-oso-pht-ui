// storage.ts
import { GetColorsSettings, ThemeA11ySettings } from '@utils/types/colors';
import { STORAGE_KEYS } from './storageKeys';

function readJSON<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJSON<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Swallow quota errors or log
  }
}

export function loadGetColors(): GetColorsSettings {
  const defaultValue: GetColorsSettings = {
    version: 1,
    paletteName: 'brand',
    contrast: 'normal',
    colorBlindMode: 'none',
    overrides: {}
  };
  const data = readJSON<GetColorsSettings>(STORAGE_KEYS.appColors);
  return data?.version === 1 ? data : defaultValue;
}

export function saveGetColors(value: GetColorsSettings) {
  writeJSON(STORAGE_KEYS.appColors, value);
}

export function loadThemeA11y(): ThemeA11ySettings {
  const defaultValue: ThemeA11ySettings = {
    version: 1,
    mode: 'system',
    reducedMotion: false,
    focusVisibleAlways: false,
    accessibilityMode: undefined
  };
  const data = readJSON<ThemeA11ySettings>(STORAGE_KEYS.themeA11y);
  return data?.version === 1 ? data : defaultValue;
}

export function saveThemeA11y(value: ThemeA11ySettings) {
  writeJSON(STORAGE_KEYS.themeA11y, value);
}
