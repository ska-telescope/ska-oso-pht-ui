import useTheme from '@mui/material/styles/useTheme';
import { Logo, Symbol, THEME_DARK } from '@ska-telescope/ska-gui-components';
interface SKAOIconProps {
  logoHeight?: number;
  useSymbol?: Boolean;
}

export default function SKAOIcon({ logoHeight = 60, useSymbol = false }: SKAOIconProps) {
  const DarkTheme = () => useTheme().palette.mode === THEME_DARK;
  if (useSymbol) {
    return <Symbol dark={DarkTheme()} height={logoHeight} />;
  } else {
    return <Logo dark={DarkTheme()} height={logoHeight} />;
  }
}
