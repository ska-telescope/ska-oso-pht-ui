import React from 'react';
import useTheme from '@mui/material/styles/useTheme';
import { Logo, Symbol, THEME_DARK } from '@ska-telescope/ska-gui-components';

interface IconProps {
  logoHeight?: number;
  useSymbol?: Boolean;
}

export default function skaoIcon({ logoHeight = 60, useSymbol = false }: IconProps) {
  const DarkTheme = () => useTheme().palette.mode === THEME_DARK;
  if (useSymbol) {
    return <Symbol dark={DarkTheme()} height={logoHeight} />;
  } else {
    return <Logo dark={DarkTheme()} height={logoHeight} />;
  }
}
