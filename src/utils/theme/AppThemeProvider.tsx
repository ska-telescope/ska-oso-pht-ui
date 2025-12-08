// AppThemeProvider.tsx
import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '@/services/theme/theme';
import { useThemeA11y } from '@/utils/colors/ThemeAllyContext';

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useThemeA11y();

  // Resolve dark/light mode
  const prefersDark =
    settings.mode === 'system'
      ? typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
      : settings.mode === 'dark';

  // Build the MUI theme using your extended theme.tsx
  const muiTheme = React.useMemo(
    () =>
      theme({
        themeMode: prefersDark ? 'dark' : 'light',
        accessibilityMode: settings.accessibilityMode ?? 'default',
        reducedMotion: settings.reducedMotion,
        focusVisibleAlways: settings.focusVisibleAlways
      }),
    [prefersDark, settings.accessibilityMode, settings.reducedMotion, settings.focusVisibleAlways]
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
};
