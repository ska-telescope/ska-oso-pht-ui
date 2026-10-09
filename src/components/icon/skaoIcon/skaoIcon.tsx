import { useTheme } from '@mui/material/styles';
import { Logo, Symbol, THEME_DARK } from '@ska-telescope/ska-gui-components';
interface SKAOIconProps {
  logoHeight?: number;
  useSymbol?: boolean;
}

export default function SKAOIcon({ logoHeight = 60, useSymbol = false }: SKAOIconProps) {
  const darkTheme = useTheme().palette.mode === THEME_DARK;
  if (useSymbol) {
    return <Symbol dark={darkTheme} height={logoHeight} />;
  } else {
    return <Logo dark={darkTheme} height={logoHeight} />;
  }
}
