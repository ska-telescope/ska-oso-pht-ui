import { createTheme, PaletteOptions } from '@mui/material';
import {
  Theme,
  THEME_LIGHT,
  THEME_DARK,
  ACCESSIBILITY_DEFAULT,
  ACCESSIBILITY_PROTANOPIA,
  ACCESSIBILITY_PROTANOMALY,
  ACCESSIBILITY_DEUTERANOPIA,
  ACCESSIBILITY_DEUTERANOMALY,
  ACCESSIBILITY_TRITANOPIA,
  ACCESSIBILITY_TRITANOMALY,
  ACCESSIBILITY_ACHROMATOMALY,
  ACCESSIBILITY_ACHROMATOPSIA
} from '@ska-telescope/ska-gui-components';

export type ThemeMode = typeof THEME_LIGHT | typeof THEME_DARK;

export type AccessibilityMode =
  | typeof ACCESSIBILITY_DEFAULT
  | typeof ACCESSIBILITY_PROTANOPIA
  | typeof ACCESSIBILITY_PROTANOMALY
  | typeof ACCESSIBILITY_DEUTERANOPIA
  | typeof ACCESSIBILITY_DEUTERANOMALY
  | typeof ACCESSIBILITY_TRITANOPIA
  | typeof ACCESSIBILITY_TRITANOMALY
  | typeof ACCESSIBILITY_ACHROMATOMALY
  | typeof ACCESSIBILITY_ACHROMATOPSIA;

export type ThemeInput =
  | ThemeMode
  | {
      themeMode: ThemeMode;
      accessibilityMode?: AccessibilityMode;
      reducedMotion?: boolean;
      focusVisibleAlways?: boolean;
    };

const COLOR_RED = 0;
const COLOR_ORANGE = 1;
const COLOR_GREEN = 3;
const COLOR_BLUE = 4;

const buildSemanticColors = (set: any): PaletteOptions => {
  const c = set.colors;
  const t = set.textColors;

  return {
    success: {
      main: c[COLOR_GREEN],
      contrastText: t[COLOR_GREEN]
    },
    warning: {
      main: c[COLOR_ORANGE],
      contrastText: t[COLOR_ORANGE]
    },
    error: {
      main: c[COLOR_RED],
      contrastText: t[COLOR_RED]
    },
    info: {
      main: c[COLOR_BLUE],
      contrastText: t[COLOR_BLUE]
    }
  };
};

const theme = (mode: ThemeInput) => {
  const base = Theme(mode);
  const paletteSet: any = (base as any).paletteSet;
  const semantic = paletteSet ? buildSemanticColors(paletteSet) : {};

  return createTheme({
    ...base,
    palette: {
      ...base.palette,
      ...semantic
    }
  });
};

export default theme;
