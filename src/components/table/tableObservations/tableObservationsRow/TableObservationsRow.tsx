import { TableRow, TableCell, IconButton, Box, Typography, Collapse } from '@mui/material';
import { ChevronRight, ExpandMore } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import EditIcon from '@/components/icon/editIcon/editIcon';
import TrashIcon from '@/components/icon/trashIcon/trashIcon';
import { useInitializeAccessStore } from '@/utils/aaa/aaaUtils';
import { getColors } from '@/utils/colors/colors';
import FrequencySpectrum from '@/components/fields/frequencySpectrum/frequencySpectrum';
import { FREQUENCY_HZ, FREQUENCY_MHZ, TYPE_CONTINUUM } from '@/utils/constants';
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
  const { osdLOW } = useOSDAccessors();
  useInitializeAccessStore();

  const observation = item;
  const isContinuum = observation?.type === TYPE_CONTINUUM;

  const getObservationColors = (type: string, value?: unknown, dim?: number) =>
    getColors({
      type,
      colors: String(value ?? ''),
      content: 'both',
      asArray: true,
      ...(dim ? { dim } : {})
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
        {/* Collapse / Edit / Delete */}
        <TableCell role="gridcell" sx={{ maxWidth: 120, p: 0 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            {false && (
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
              <EditIcon onClick={() => editClicked(item)} toolTip={t('observations.edit')} />
            )}

            {deleteClicked && (
              <TrashIcon onClick={() => deleteClicked(item)} toolTip={t('observations.delete')} />
            )}
          </Box>
        </TableCell>

        {/* Observation Type */}
        <TableCell
          role="gridcell"
          sx={{
            borderLeft: '10px solid',
            borderColor: colorsObType[0],
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
              backgroundColor: colorsTelescope[0],
              borderRadius: 1,
              px: 1,
              display: 'inline-flex'
            }}
          >
            <Typography
              variant="body2"
              color={colorsTelescope[1]}
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
              backgroundColor: colorsTelescopeDim[0],
              borderRadius: 0,
              px: 1,
              display: 'inline-flex'
            }}
          >
            <Typography
              variant="body2"
              color={colorsTelescopeDim[1]}
              sx={{ whiteSpace: 'nowrap', p: 1 }}
            >
              {t('observingBand.short.' + observation?.rec?.observingBand)}
            </Typography>
          </Box>
        </TableCell>

        {/* Frequency Spectrum */}
        <TableCell>
          <FrequencySpectrum
            minFreq={frequencyConversion(
              (osdLOW?.basicCapabilities?.minFrequencyHz ?? 0) * 10,
              FREQUENCY_HZ,
              FREQUENCY_MHZ
            )}
            maxFreq={frequencyConversion(
              (osdLOW?.basicCapabilities?.maxFrequencyHz ?? 0) * 10,
              FREQUENCY_HZ,
              FREQUENCY_MHZ
            )}
            centerFreq={frequencyConversion(
              observation?.rec?.centralFrequency ?? 0,
              observation?.rec?.centralFrequencyUnits ?? FREQUENCY_HZ,
              FREQUENCY_MHZ
            )}
            bandWidth={
              isContinuum
                ? observation?.rec?.continuumBandwidth ?? 0
                : observation?.rec?.bandwidth ?? 0
            }
            minEdge={frequencyConversion(
              (osdLOW?.basicCapabilities?.minFrequencyHz ?? 0) * 10,
              FREQUENCY_HZ,
              FREQUENCY_MHZ
            )}
            maxEdge={frequencyConversion(
              (osdLOW?.basicCapabilities?.maxFrequencyHz ?? 0) * 10,
              FREQUENCY_HZ,
              FREQUENCY_MHZ
            )}
            bandColor={colorsTelescopeDim[0]}
            bandColorContrast={colorsTelescopeDim[1]}
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
