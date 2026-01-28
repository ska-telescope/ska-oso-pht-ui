import React from 'react';
import { Box, Stack } from '@mui/system';
import { DataGrid, getColors } from '@ska-telescope/ska-gui-components';
import { Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { OSD_CONSTANTS } from '@utils/OSDConstants.ts';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import Observation from '@/utils/types/observation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { TYPE_ZOOM } from '@/utils/constants';

const ROW_HEIGHT = 165;

interface GridObservationProps {
  data: Observation[];
  disabled?: boolean;
  rowClick?: (params: any) => void;
  displayOption?: number;
}

export default function GridObservation({
  data,
  disabled = false,
  rowClick,
  displayOption = 0
}: GridObservationProps) {
  const { t } = useScopedTranslation();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const hasSelectedRef = React.useRef(false);
  const { isSV } = useOSDAccessors();

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
    <Typography
      variant="subtitle1"
      fontWeight="bold"
      style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'inline-block',
        maxWidth: '100%'
      }}
    >
      {inValue}
    </Typography>
  );

  const displayFrequency = (inValue: string) => (
    <Typography variant="subtitle1">
      {t('centralFrequency.label')}:{' '}
      <Typography component="span" fontWeight="bold">
        {inValue}
      </Typography>
    </Typography>
  );

  const displayContinuumBandwidth = (inValue: string) => (
    <Typography variant="subtitle1">
      {t('bandwidth.label.1')}:{' '}
      <Typography component="span" fontWeight="bold">
        {inValue}
      </Typography>
    </Typography>
  );

  const displayZoomBandwidth = (inValue: number) => (
    <Typography variant="subtitle1">
      {t('bandwidth.label.0')}:{' '}
      <Typography component="span" fontWeight="bold">
        {OSD_CONSTANTS.array[0].bandWidth[inValue - 1]?.label}
      </Typography>
    </Typography>
  );

  const displaySubarray = (inArray: string, inType: string) => (
    <Typography variant="subtitle1" fontWeight="bold">
      {t('subArrayConfiguration.' + inArray)} |{' '}
      {t((isSV ? 'observationType.' : 'scienceCategory.') + inType)}
    </Typography>
  );

  const isZoom = (inType: string) => inType === TYPE_ZOOM;

  const getObservationColors = (type: string, value?: unknown, dim?: number) =>
    getColors({
      type,
      colors: String(value ?? ''),
      content: 'both',
      asArray: true,
      ...(dim ? { dim } : {}),
      paletteIndex: Number(localStorage.getItem('skao_accessibility_mode'))
    }) ?? [];

  const colObservation: GridColDef = {
    field: 'id',
    renderHeader: () => headerDisplay('observations.label'),
    flex: 1,
    minWidth: 0,
    maxWidth: Number.MAX_SAFE_INTEGER,
    resizable: false,
    renderCell: e => {
      const isSelected = String(e.row.id) === selectedId;
      const centralFrequencyUnits = OSD_CONSTANTS.Units[e.row.centralFrequencyUnits]?.label ?? '';
      const bandwidthUnits =
        OSD_CONSTANTS.Units[
          isZoom(e.row.type) ? e.row.zoomBandwidthUnits : e.row.continuumBandwidthUnits
        ]?.label ?? '';
      return (
        <Stack
          direction="column"
          sx={{
            backgroundColor: isSelected
              ? getObservationColors('observationType', e.row?.type, 0.2).bg[0]
              : 'transparent',
            border: '10px solid',
            borderRadius: 1,
            borderColor: getObservationColors('telescope', e.row?.telescope, 0.4).bg[0]
          }}
        >
          {displayName(e.row.id)}
          {displayFrequency(e.row.centralFrequency + ' ' + centralFrequencyUnits)}
          {!isZoom(e.row.type) &&
            displayContinuumBandwidth(e.row.continuumBandwidth + ' ' + bandwidthUnits)}
          {isZoom(e.row.type) && displayZoomBandwidth(Number(e.row.bandwidth))}
          {displaySubarray(e.row.subarray, e.row.type)}
        </Stack>
      );
    }
  };

  // Get columns based on display option, will be extended in future
  const getColumns = (option: number): GridColDef[] => {
    switch (option) {
      default:
        return [colObservation];
    }
  };

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
        columns={getColumns(displayOption)}
        getRowHeight={() => ROW_HEIGHT}
        hideFooter
        onRowClick={disabled ? undefined : handleRowClick}
        rowSelectionModel={disabled ? [] : selectedId ? [selectedId] : []}
        autoHeight={false}
        testId="gridObservation"
        sx={{
          width: '100%',
          height: gridHeight,
          minHeight: 0,
          overflow: 'hidden',
          pointerEvents: disabled ? 'none' : 'auto',
          opacity: disabled ? 0.5 : 1
        }}
      />
    </Box>
  );
}
