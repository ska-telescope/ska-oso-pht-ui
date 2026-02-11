import { Theme as BaseTheme, getColors } from '@ska-telescope/ska-gui-components';

const theme = ({
  themeMode,
  accessibilityMode
}: {
  themeMode: string;
  accessibilityMode: number;
}) => {
  const base = BaseTheme({ themeMode });

  const colors =
    getColors({
      type: 'chart',
      colors: '*',
      content: 'bg',
      asArray: true,
      paletteIndex: accessibilityMode
    }) ?? [];

  if (!colors.length) return base;

  const error = colors[0];
  const warning = colors[1];
  const success = colors[3];
  const info = colors[4];

  return {
    ...base,
    cssVars: {
      ...base.cssVars,
      '--ska-color-error': error,
      '--ska-color-warning': warning,
      '--ska-color-success': success,
      '--ska-color-info': info
    }
  };
};

export default theme;
