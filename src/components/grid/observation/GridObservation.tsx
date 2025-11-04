import React from 'react';
import { Box, Stack, useTheme } from '@mui/system';
import { DataGrid } from '@ska-telescope/ska-gui-components';
import Typography from '@mui/material/Typography';
import { GridColDef } from '@mui/x-data-grid';
import { OSD_CONSTANTS } from '@utils/OSDConstants.ts';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import Observation from '@/utils/types/observation';

const ROW_HEIGHT = 200;

interface GridObservationProps {
  data: Observation[];
  rowClick?: (params: any) => void;
}

export default function GridObservation({ data, rowClick }: GridObservationProps) {
  const { t } = useScopedTranslation();
  const theme = useTheme();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const hasSelectedRef = React.useRef(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [gridHeight, setGridHeight] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        const height = containerRef.current?.clientHeight;
        if (height) setGridHeight(height);
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  React.useEffect(() => {
    if (data.length > 0 && !hasSelectedRef.current) {
      const firstId = String(data[0].id);
      setSelectedId(firstId);
      rowClick?.({ row: data[0] });
      hasSelectedRef.current = true;
    }
  }, [data, rowClick]);

  const handleRowClick = (params: any) => {
    const clickedId = String(params.row.id);
    setSelectedId(clickedId);
    rowClick?.(params);
  };

  const headerDisplay = (inValue: string) => (
    <Typography variant="subtitle1" fontWeight="bold">
      {t(inValue)}
    </Typography>
  );

  const displayName = (inValue: string) => (
    <Typography variant="subtitle1" fontWeight="bold">
      {inValue}
    </Typography>
  );

  const displayFrequency = (inValue: string) => (
    <Typography variant="subtitle1">
      {t('centralFrequency.label')} : {inValue}
    </Typography>
  );

  const displayContinuumBandwidth = (inValue: string) => (
    <Typography variant="subtitle1">
      {t('bandwidth.label.1')} : {inValue}
    </Typography>
  );

  const displayZoomBandwidth = (inValue: string) => (
    <Typography variant="subtitle1">
      {t('bandwidth.label.0')} :{' '}
      {OSD_CONSTANTS.array[1].bandWidth.find(ar => ar.value === Number(inValue))?.label}
    </Typography>
  );

  const displayNumSubBands = (inValue: string) => (
    <Typography variant="subtitle1">
      {t('subBands.short')} : {inValue}
    </Typography>
  );

  const displaySubarray = (inArray: string, inType: string) => (
    <Box pl={2}>
      <Typography variant="subtitle1" fontWeight="bold">
        {t('subArrayConfiguration.' + inArray)} | {t('observationType.' + inType)}
      </Typography>
    </Box>
  );

  const isZoom = (inType: number) => inType === 0;

  const colObservation: GridColDef = {
    field: 'id',
    renderHeader: () => headerDisplay('observations.label'),
    flex: 1,
    minWidth: 0,
    maxWidth: Number.MAX_SAFE_INTEGER,
    resizable: false,
    renderCell: e => {
      const isSelected = String(e.row.id) === selectedId;
      return (
        <Stack
          direction="column"
          sx={{
            backgroundColor: isSelected ? theme.palette.primary.light : 'transparent'
          }}
        >
          {displayName(e.row.id)}
          {displayFrequency(e.row.centralFrequency)}
          {!isZoom(e.row.type) && displayContinuumBandwidth(e.row.continuumBandwidth)}
          {isZoom(e.row.type) && displayZoomBandwidth(e.row.bandwidth)}
          {displayNumSubBands(e.row.numSubBands)}
          {displaySubarray(e.row.subarray, e.row.type)}
        </Stack>
      );
    }
  };

  const columns: GridColDef[] = [colObservation];

  return (
    <Box
      ref={containerRef}
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
      <DataGrid
        rows={data}
        columns={columns}
        getRowHeight={() => ROW_HEIGHT}
        hideFooter
        onRowClick={handleRowClick}
        rowSelectionModel={selectedId ? [selectedId] : []}
        autoHeight={false}
        testId="gridObservation"
        sx={{
          width: '100%',
          height: gridHeight,
          minHeight: 0,
          overflow: 'hidden'
        }}
      />
    </Box>
  );
}
