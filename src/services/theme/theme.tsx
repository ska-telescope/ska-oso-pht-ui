import { createTheme } from '@mui/material';
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

// Define valid theme modes
export type ThemeMode = typeof THEME_LIGHT | typeof THEME_DARK;

// Define valid accessibility modes
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

// Define accepted input shape
export type ThemeInput =
  | ThemeMode
  | {
      themeMode: ThemeMode;
      accessibilityMode?: AccessibilityMode;
    };

// Create and export the theme
const theme = (mode: ThemeInput) => createTheme(Theme(mode));

export default theme;
