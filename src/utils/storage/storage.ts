// storage.ts
import { GetColorsSettings, ThemeA11ySettings } from '@utils/types/colors';
import type { ProposalType } from '@/models/proposals/proposal';

export const STORAGE_KEYS = {
  appColors: 'app:getColors:v1',
  themeA11y: 'app:themeA11y:v1',
  proposalDraft: (prslId: string) => `pht:proposalDraft:${prslId}`
} as const;

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
    accessibilityMode: ''
  };
  const data = readJSON<ThemeA11ySettings>(STORAGE_KEYS.themeA11y);
  return data?.version === 1 ? data : defaultValue;
}

export function saveThemeA11y(value: ThemeA11ySettings) {
  writeJSON(STORAGE_KEYS.themeA11y, value);
}

export interface ProposalDraft {
  savedAt: string;
  values: ProposalType;
}

/** Stores the proposal form's local edits, keyed by the proposal's ID. */
export function saveProposalDraft(prslId: string, values: ProposalType) {
  const draft: ProposalDraft = { savedAt: new Date().toISOString(), values };
  writeJSON(STORAGE_KEYS.proposalDraft(prslId), draft);
}
