import { createTheme } from '@mui/material';
import { Theme, THEME_DARK } from '@ska-telescope/ska-gui-components';

const ACCESSIBILITY_DEFAULT = 'default'; // TODO: Eventually come from library

const theme = (mode = THEME_DARK) => {
  const rawTheme = Theme({ themeMode: mode, accessibilityMode: ACCESSIBILITY_DEFAULT });

  const palette =
    typeof rawTheme.palette.primary === 'string'
      ? {
          ...rawTheme.palette,
          primary: { main: rawTheme.palette.primary },
          secondary: { main: rawTheme.palette.secondary },
          mode: mode
        }
      : rawTheme.palette;

  return createTheme({
    ...rawTheme,
    palette
  });
};

export default theme;
