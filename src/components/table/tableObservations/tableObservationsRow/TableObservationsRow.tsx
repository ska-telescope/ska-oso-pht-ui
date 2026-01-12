import { TableRow, TableCell, IconButton, Box, Typography, Collapse } from '@mui/material';
import { ChevronRight, ExpandMore } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { FrequencySpectrum, getColors } from '@ska-telescope/ska-gui-components';
import EditIcon from '@/components/icon/editIcon/editIcon';
import TrashIcon from '@/components/icon/trashIcon/trashIcon';
import { useInitializeAccessStore } from '@/utils/aaa/aaaUtils';
import {
  FREQUENCY_GHZ,
  FREQUENCY_HZ,
  FREQUENCY_MHZ,
  TEL_UNITS,
  TELESCOPE_LOW_NUM,
  TELESCOPE_MID_NUM,
  TYPE_CONTINUUM
} from '@/utils/constants';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import ObservationInfo from '@/components/info/observation/Observation';
import { frequencyConversion } from '@/utils/helpers';

// NOTE
//
// The icon to expand the row is currently hidden (false && ...) because there is no
// content to show in the expanded section yet. Once content is added, this can be
// re-enabled.

interface TableObservationsRowProps {
  item: any;
  index: number;
  expanded: boolean;
  deleteClicked?: Function;
  editClicked?: Function;
  toggleRow: (id: number) => void;
  expandButtonRef: (el: HTMLButtonElement | null) => void;
  t: any;
}

export default function TableObservationsRow({
  item,
  index,
  expanded,
  deleteClicked,
  editClicked,
  toggleRow,
  expandButtonRef,
  t
}: TableObservationsRowProps) {
  const theme = useTheme();
  const { osdLOW, osdMID } = useOSDAccessors();
  useInitializeAccessStore();

  const observation = item;
  const isContinuum = observation?.type === TYPE_CONTINUUM;
  const isLow = observation?.telescope === TELESCOPE_LOW_NUM;
  const isMid = observation?.telescope === TELESCOPE_MID_NUM;

  let min = 0;
  let max = 0;
  if (isMid) {
    const receiver = osdMID?.basicCapabilities?.receiverInformation.find(
      e => e.rxId === String(observation?.rec?.observingBand)
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
    observation?.rec?.centralFrequency ?? 0,
    observation?.rec?.centralFrequencyUnits ?? FREQUENCY_HZ,
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

  const colorsObType = useMemo(() => getObservationColors('observationType', observation?.type), [
    observation?.type
  ]);
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
        key={item.id}
        data-testid={`row-${item.id}`}
        sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}
        role="row"
        aria-rowindex={index + 2}
      >
        <TableCell role="gridcell" sx={{ maxWidth: 120, p: 0 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            {false && ( // Currently no expanded content to show
              <IconButton
                ref={expandButtonRef}
                aria-label={`${expanded ? 'Collapse' : 'Expand'} details for ${item.title}.`}
                aria-expanded={expanded}
                aria-controls={`observation-details-${item.id}`}
                size="small"
                onClick={() => toggleRow(item.id)}
                data-testid={`expand-button-${item.id}`}
                sx={{ transition: 'transform 0.2s' }}
              >
                {expanded ? <ExpandMore /> : <ChevronRight />}
              </IconButton>
            )}

            {editClicked && (
              <Box display="flex" flexDirection="column" alignItems="center">
                <EditIcon onClick={() => editClicked(item)} toolTip={t('observations.edit')} />
                <Typography variant="caption">{t('edit.label')}</Typography>
              </Box>
            )}

            {deleteClicked && (
              <Box display="flex" flexDirection="column" alignItems="center">
                <TrashIcon onClick={() => deleteClicked(item)} toolTip={t('observations.delete')} />
                <Typography variant="caption">{t('deleteBtn.label')}</Typography>
              </Box>
            )}
          </Box>
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
              {t('observingBand.short.' + observation?.rec?.observingBand)}
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
              isContinuum
                ? observation?.rec?.continuumBandwidth ?? 0
                : observation?.rec?.bandwidth ?? 0
            }
            bandColor={colorsTelescopeDim.bg[0]}
            bandColorContrast={colorsTelescopeDim.fg[0]}
            unit={TEL_UNITS[observation?.telescope]}
          />
        </TableCell>
      </TableRow>

      {/* Expanded Row */}
      <TableRow key={`${item.id}-expanded`}>
        <TableCell sx={{ p: 0 }} colSpan={9} role="gridcell">
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ overflowX: 'hidden' }}>
              {observation.rec && <ObservationInfo t={t} observation={observation.rec} />}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
