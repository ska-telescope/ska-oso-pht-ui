import React from 'react';
import { Box, Stack } from '@mui/system';
import { Typography } from '@mui/material';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import {
  OBSERVING_MODE,
  OBSERVING_MODE_TRANSLATION_KEY,
  spectralResolutionText,
  type ObservationInput
} from '@/models/proposals/observations';

interface GridObservationProps {
  data: ObservationInput[];
  disabled?: boolean;
  rowClick?: (params: any) => void;
  displayOption?: number;
  autoSelectId?: string | number;
}

// The spectral resolution of the modes without a zoom factor
const HARD_CODED_SPECTRAL_RESOLUTION_BY_MODE: Partial<Record<string, string>> = {
  [OBSERVING_MODE.CONTINUUM]: '5.43 kHz',
  [OBSERVING_MODE.PST]: '3.62 kHz'
};

// A value with its unit, or a dash while it's missing
const withUnit = (quantity: { value: number | null; unit: string | null }) =>
  quantity.value === null ? '-' : `${quantity.value} ${quantity.unit ?? ''}`;
export default function GridObservation({
  data,
  disabled = false,
  rowClick,
  autoSelectId
}: GridObservationProps) {
  const { t } = useScopedTranslation();
  const hasSelectedRef = React.useRef(false);

  React.useEffect(() => {
    if (data.length === 0) return;

    // If an explicit autoSelectId is provided AND exists in the dataset
    if (autoSelectId != null) {
      const match = data.find((o) => String(o.id) === String(autoSelectId));
      if (match) {
        rowClick?.({ row: match });
        return;
      }
    }

    // Otherwise fall back to first row, but only once
    if (!hasSelectedRef.current) {
      const first = data[0];
      rowClick?.({ row: first });
      hasSelectedRef.current = true;
    }
  }, [data, autoSelectId, rowClick]);

  const handleRowClick = (params: any) => {
    rowClick?.(params);
  };

  const rowContent = (row: ObservationInput) => {
    const observingMode = t('observationType.' + OBSERVING_MODE_TRANSLATION_KEY[row.observingMode]);
    const spectralResolution =
      row.observingMode === OBSERVING_MODE.SPECTRAL
        ? row.zoomFactor === null
          ? undefined
          : spectralResolutionText(row.telescope, row.zoomFactor, row.centralFrequency)
        : HARD_CODED_SPECTRAL_RESOLUTION_BY_MODE[row.observingMode];

    return (
      <Stack
        key={row.id}
        direction="column"
        onClick={disabled ? undefined : () => handleRowClick({ row })}
        sx={{
          backgroundColor: 'transparent',
          mb: 1.5,
          cursor: disabled ? 'default' : 'pointer',
          pointerEvents: disabled ? 'none' : 'auto'
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 'bold'
          }}
        >
          {row.id}
        </Typography>
        <Typography variant="subtitle2">
          Subarray:{' '}
          <Box component="span" sx={{ fontWeight: 'bold' }}>
            {t('subArrayConfiguration.' + row.subarray)}
          </Box>
        </Typography>
        <Typography variant="subtitle2">
          Observing Mode:{' '}
          <Box component="span" sx={{ fontWeight: 'bold' }}>
            {observingMode}
          </Box>
        </Typography>
        <Typography variant="subtitle2">
          Central Frequency:{' '}
          <Box component="span" sx={{ fontWeight: 'bold' }}>
            {withUnit(row.centralFrequency)}
          </Box>
        </Typography>
        {spectralResolution && (
          <Typography variant="subtitle2">
            Spectral Resolution:{' '}
            <Box component="span" sx={{ fontWeight: 'bold' }}>
              {spectralResolution}
            </Box>
          </Typography>
        )}
        <Typography variant="subtitle2">
          Integration Time:{' '}
          <Box component="span" sx={{ fontWeight: 'bold' }}>
            {withUnit(row.integrationTime)}
          </Box>
        </Typography>
      </Stack>
    );
  };

  return (
    <Box
      data-testid="gridObservationContainer"
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        minHeight: 0
      }}
    >
      <Box
        data-testid="gridObservation"
        sx={{ width: '90%', overflowY: 'auto', margin: '0 auto', flex: 1, minHeight: 0 }}
      >
        <Box>{data.map((row) => rowContent(row))}</Box>
      </Box>
    </Box>
  );
}
