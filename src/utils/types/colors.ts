export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
export type ContrastLevel = 'normal' | 'high';
export type AccessibilityMode = string;

export interface GetColorsSettings {
  version: 1;
  paletteName: string;
  contrast: ContrastLevel;
  colorBlindMode: ColorBlindMode;
  overrides?: Record<string, string>;
}

export interface ThemeA11ySettings {
  version: 1;
  mode: 'light' | 'dark' | 'system';
  reducedMotion: boolean;
  focusVisibleAlways: boolean;
  accessibilityMode: AccessibilityMode;
}
