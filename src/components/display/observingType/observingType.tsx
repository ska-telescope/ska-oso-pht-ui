import React from 'react';
import { Box, Typography } from '@mui/material';
import { getColors } from '@ska-telescope/ska-gui-components';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface ObservingTypeProps {
  type: string | undefined;
}

export default function ObservingType({ type }: ObservingTypeProps) {
  const { t } = useScopedTranslation();

  const safeGetColors = React.useCallback((type: string, value: unknown, dim?: number) => {
    const paletteIndex = Number(localStorage.getItem('skao_accessibility_mode')) || 0;

    const result =
      getColors({
        type,
        colors: String(value ?? ''),
        content: 'both',
        asArray: true,
        ...(dim ? { dim } : {}),
        paletteIndex
      }) ?? {};

    return {
      bg: Array.isArray(result.bg) ? result.bg : ['transparent'],
      fg: Array.isArray(result.fg) ? result.fg : ['inherit']
    };
  }, []);

  const colorsTelescopeDim = React.useMemo(() => safeGetColors('observationType', type, 0.6), [
    type,
    safeGetColors
  ]);

  return (
    <Box
      sx={{
        backgroundColor: colorsTelescopeDim.bg[0],
        borderRadius: 0,
        px: 1,
        display: 'inline-flex'
      }}
    >
      <Typography
        variant="body2"
        color={colorsTelescopeDim.fg[0]}
        sx={{ whiteSpace: 'nowrap', p: 1 }}
      >
        {t(`observationType.${type}`)}
      </Typography>
    </Box>
  );
}
