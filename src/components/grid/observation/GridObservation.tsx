import React from 'react';
import { Box, Stack } from '@mui/system';
import { Typography } from '@mui/material';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import Observation from '@/utils/types/observation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { getBandwidthOrFrequencyUnitsLabel } from '@/utils/helpers';

interface GridObservationProps {
  data: Observation[];
  disabled?: boolean;
  rowClick?: (params: any) => void;
  displayOption?: number;
  autoSelectId?: string | number;
}

export default function GridObservation({
  data,
  disabled = false,
  rowClick,
  autoSelectId
}: GridObservationProps) {
  const { t } = useScopedTranslation();
  const hasSelectedRef = React.useRef(false);
  const { isSV } = useOSDAccessors();

  React.useEffect(() => {
    if (data.length === 0) return;

    // If an explicit autoSelectId is provided AND exists in the dataset
    if (autoSelectId != null) {
      const match = data.find(o => String(o.id) === String(autoSelectId));
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

  const headerDisplay = (inValue: string) => (
    <Typography variant="subtitle1" fontWeight="bold">
      {t(inValue)}
    </Typography>
  );

  const rowContent = (row: Observation) => {
    const centralFrequencyUnits = getBandwidthOrFrequencyUnitsLabel(row.centralFrequencyUnits) ?? '';
    const observingMode = t((isSV ? 'observationType.' : 'scienceCategory.') + row.type);
    const integrationTime = row.supplied?.value != null ? `${row.supplied.value} h` : '-';


    return (
      <Stack
        key={row.id}
        direction="column"
        onClick={disabled ? undefined : () => handleRowClick({ row })}
        sx={{
          backgroundColor: 'transparent',
          border: '1px solid',
          borderRadius: 1,
          borderColor: 'grey.400',
          p: 2,
          mb: 1.5,
          cursor: disabled ? 'default' : 'pointer',
          pointerEvents: disabled ? 'none' : 'auto',
          opacity: disabled ? 0.5 : 1
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          {row.id}
        </Typography>
        <Typography variant="subtitle2">Subarray: {t('subArrayConfiguration.' + row.subarray)}</Typography>
        <Typography variant="subtitle2">Observing Mode: {observingMode}</Typography>
        <Typography variant="subtitle2">
          Central Frequency: {row.centralFrequency} {centralFrequencyUnits}
        </Typography>
        {row.type === 'spectral' && row.spectralResolution && (
          <Typography variant="subtitle2">Spectral Resolution: {row.spectralResolution}</Typography>
        )}
        <Typography variant="subtitle2">Integration Time: {integrationTime}</Typography>
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
      <Box data-testid="gridObservation" sx={{ width: '90%', overflowY: 'auto',
        margin: '0 auto', 
        flex: 1, 
        minHeight: 0 
      }}>
        {headerDisplay('observations.label')}
        <Box mt={1}>{data.map(row => rowContent(row))}</Box>
      </Box>
    </Box>
  );
}
