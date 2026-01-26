import { TableRow, TableCell, Box, Typography, Collapse } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { FrequencySpectrum, getColors } from '@ska-telescope/ska-gui-components';
import EditIcon from '@/components/icon/editIcon/editIcon';
import TrashIcon from '@/components/icon/trashIcon/trashIcon';
import { useInitializeAccessStore } from '@/utils/aaa/aaaUtils';
import Proposal from '@/utils/types/proposal';
import {
  FREQUENCY_GHZ,
  FREQUENCY_HZ,
  FREQUENCY_MHZ,
  TEL_UNITS,
  TELESCOPE_LOW_NUM,
  TELESCOPE_MID_NUM,
  TYPE_CONTINUUM,
  TYPE_PST
} from '@/utils/constants';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import DataProduct from '@/components/info/dataProduct/DataProduct';
import { frequencyConversion, getBandwidthLowZoom, getBandwidthZoom } from '@/utils/helpers';
import ExpandIcon from '@/components/icon/expandIcon/expandIcon';
import { DataProductSDPNew } from '@/utils/types/dataProduct';

interface TableDataProductsRowProps {
  item: any;
  index: number;
  proposal: Proposal;
  expanded: boolean;
  deleteClicked?: Function;
  editClicked?: Function;
  toggleRow: (id: string) => void;
  expandButtonRef?: (el: HTMLButtonElement | null) => void;
  t: any; // useScopedTranslation
}

export default function TableDataProductsRow({
  item,
  index,
  proposal,
  expanded,
  deleteClicked,
  editClicked,
  toggleRow,
  // expandButtonRef,
  t
}: TableDataProductsRowProps) {
  const theme = useTheme();
  const { osdLOW, osdMID } = useOSDAccessors();
  useInitializeAccessStore();

  const observation = useMemo(
    () => proposal?.observations?.find(obs => obs.id === item.observationId),
    [proposal, item.observationId]
  );

  const isContinuum = observation?.type === TYPE_CONTINUUM;
  const isPST = observation?.type === TYPE_PST;
  const isLow = observation?.telescope === TELESCOPE_LOW_NUM;
  const isMid = observation?.telescope === TELESCOPE_MID_NUM;

  let min = 0;
  let max = 0;
  if (isMid) {
    const receiver = osdMID?.basicCapabilities?.receiverInformation.find(
      e => e.rxId === String(observation?.observingBand)
    );
    min = receiver?.minFrequencyHz ?? 0;
    max = receiver?.maxFrequencyHz ?? 0;
  } else {
    min = osdLOW?.basicCapabilities?.minFrequencyHz ?? 0;
    max = osdLOW?.basicCapabilities?.maxFrequencyHz ?? 0;
  }
  const minFreq = frequencyConversion(min, FREQUENCY_HZ, isLow ? FREQUENCY_MHZ : FREQUENCY_GHZ);
  const maxFreq = frequencyConversion(max, FREQUENCY_HZ, isLow ? FREQUENCY_MHZ : FREQUENCY_GHZ);
  const centerFreq = frequencyConversion(
    observation?.centralFrequency ?? 0,
    observation?.centralFrequencyUnits ?? FREQUENCY_HZ,
    isLow ? FREQUENCY_MHZ : FREQUENCY_GHZ
  );

  const getObservationColors = (type: string, value?: unknown, dim?: number) =>
    getColors({
      type,
      colors: String(value ?? ''),
      content: 'both',
      asArray: true,
      ...(dim ? { dim } : {}),
      paletteIndex: Number(localStorage.getItem('skao_accessibility_mode'))
    }) ?? [];

  const colorsObType = useMemo(
    () => getObservationColors('observationType', observation?.type, 0.6),
    [observation?.type]
  );
  const colorsTelescope = useMemo(() => getObservationColors('telescope', observation?.telescope), [
    observation?.telescope
  ]);
  const colorsTelescopeDim = useMemo(
    () => getObservationColors('telescope', observation?.telescope, 0.6),
    [observation?.telescope]
  );

  return (
    <>
      <TableRow
        key={Number(item.id)}
        data-testid={`row-${item.id}`}
        sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}
        role="row"
        aria-rowindex={index + 2}
      >
        {/* Collapse / Edit / Delete */}
        <TableCell role="gridcell" sx={{ maxWidth: 120, p: 0 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <ExpandIcon
                onClick={() => toggleRow(item.id)}
                toolTip={t('editDataProduct.toolTip')}
                expanded={expanded}
              />
              <Typography variant="caption">
                {t(expanded ? 'collapse.label' : 'expand.label')}
              </Typography>
            </Box>

            {editClicked && (
              <Box display="flex" flexDirection="column" alignItems="center">
                <EditIcon
                  onClick={() => editClicked(item)}
                  toolTip={t('editDataProduct.toolTip')}
                />
                <Typography variant="caption">{t('edit.label')}</Typography>
              </Box>
            )}

            {deleteClicked && (
              <Box display="flex" flexDirection="column" alignItems="center">
                <TrashIcon
                  onClick={() => deleteClicked(item)}
                  toolTip={t('deleteDataProduct.toolTip')}
                />
                <Typography variant="caption">{t('deleteBtn.label')}</Typography>
              </Box>
            )}
          </Box>
        </TableCell>

        {/* SDP ID */}
        <TableCell role="gridcell" sx={{ whiteSpace: 'nowrap' }}>
          <Typography variant="body2" color="text.secondary">
            {item.id}
          </Typography>
        </TableCell>

        {/* Observation Type */}
        <TableCell
          role="gridcell"
          sx={{
            borderLeft: '10px solid',
            borderColor: colorsObType.bg[0],
            pl: 1,
            width: '1%',
            whiteSpace: 'nowrap'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {t('observationType.' + observation?.type)}
          </Typography>
        </TableCell>

        {/* Observation ID */}
        <TableCell role="gridcell" sx={{ whiteSpace: 'nowrap' }}>
          <Typography variant="body2" color="text.secondary">
            {item.observationId}
          </Typography>
        </TableCell>

        {/* Telescope + Subarray */}
        <TableCell role="gridcell" sx={{ whiteSpace: 'nowrap' }}>
          <Box
            sx={{
              backgroundColor: colorsTelescope.bg[0],
              borderRadius: 1,
              px: 1,
              display: 'inline-flex'
            }}
          >
            <Typography
              variant="body2"
              color={colorsTelescope.fg[0]}
              sx={{ whiteSpace: 'nowrap', p: 1 }}
            >
              {t('telescopes.' + observation?.telescope)}{' '}
              {t('subArrayConfiguration.' + observation?.subarray)}
            </Typography>
          </Box>
        </TableCell>

        {/* Observing Band */}
        <TableCell role="gridcell" sx={{ whiteSpace: 'nowrap' }}>
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
              {t('observingBand.short.' + observation?.observingBand)}
            </Typography>
          </Box>
        </TableCell>

        {/* Frequency Spectrum */}
        <TableCell>
          <FrequencySpectrum
            minFreq={minFreq}
            maxFreq={maxFreq}
            centerFreq={centerFreq}
            bandWidth={
              isContinuum || isPST
                ? observation?.continuumBandwidth ?? 0
                : frequencyConversion(
                    isLow
                      ? getBandwidthLowZoom(observation?.bandwidth ?? 0)?.value ?? 0
                      : getBandwidthZoom(observation ?? null),
                    isLow ? FREQUENCY_MHZ : FREQUENCY_GHZ,
                    FREQUENCY_MHZ
                  ) ?? 0
            }
            bandColor={colorsTelescopeDim.bg[0]}
            bandColorContrast={colorsTelescopeDim.fg[0]}
            unit={TEL_UNITS[observation?.telescope ?? 0]}
          />
        </TableCell>
      </TableRow>

      {/* Expanded Row */}
      <TableRow key={`${item.id}-expanded`}>
        <TableCell sx={{ p: 0 }} colSpan={9} role="gridcell">
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ overflowX: 'hidden' }}>
              {observation && (
                <DataProduct t={t} sdp={item as DataProductSDPNew} observation={observation} />
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
