import { TableRow, TableCell, IconButton, Box, Typography, Collapse } from '@mui/material';
import { ChevronRight, ExpandMore } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { getColors } from '@ska-telescope/ska-gui-components';
import { FrequencySpectrum } from '@ska-telescope/ska-gui-components';
import EditIcon from '@/components/icon/editIcon/editIcon';
import TrashIcon from '@/components/icon/trashIcon/trashIcon';
import { useInitializeAccessStore } from '@/utils/aaa/aaaUtils';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import ObservationInfo from '@/components/info/observation/Observation';
import ObservingBand from '@/components/display/observingBand/observingBand';
import {
  OBSERVING_MODE_TRANSLATION_KEY,
  spectrumOf,
  TELESCOPE_NUMBER,
  type ObservationInput
} from '@/models/proposals/observations';

// NOTE
//
// The icon to expand the row is currently hidden (false && ...) because there is no
// content to show in the expanded section yet. Once content is added, this can be
// re-enabled.

interface TableObservationsRowProps {
  observation: ObservationInput;
  index: number;
  expanded: boolean;
  deleteClicked?: (observation: ObservationInput) => void;
  editClicked?: (observation: ObservationInput) => void;
  toggleRow: (id: string) => void;
  expandButtonRef: (el: HTMLButtonElement | null) => void;
  t: any;
}

export default function TableObservationsRow({
  observation,
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

  const observingMode = OBSERVING_MODE_TRANSLATION_KEY[observation.observingMode];
  const telescopeNumber = TELESCOPE_NUMBER[observation.telescope];

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
    () => getObservationColors('observationType', observingMode, 0.6),
    [observingMode]
  );
  const colorsTelescope = useMemo(
    () => getObservationColors('telescope', telescopeNumber),
    [telescopeNumber]
  );
  const colorsTelescopeDim = useMemo(
    () => getObservationColors('telescope', telescopeNumber, 0.6),
    [telescopeNumber]
  );

  return (
    <>
      <TableRow
        key={observation.id}
        data-testid={`row-${observation.id}`}
        sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}
        role="row"
        aria-rowindex={index + 2}
      >
        <TableCell role="gridcell" sx={{ maxWidth: 120, p: 0 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            {false && ( // Currently no expanded content to show
              <IconButton
                ref={expandButtonRef}
                aria-label={`${expanded ? 'Collapse' : 'Expand'} details for ${observation.id}.`}
                aria-expanded={expanded}
                aria-controls={`observation-details-${observation.id}`}
                size="small"
                onClick={() => toggleRow(observation.id)}
                data-testid={`expand-button-${observation.id}`}
                sx={{ transition: 'transform 0.2s' }}
              >
                {expanded ? <ExpandMore /> : <ChevronRight />}
              </IconButton>
            )}

            {editClicked && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <EditIcon
                  onClick={() => editClicked(observation)}
                  toolTip={t('observations.edit')}
                />
                <Typography variant="caption">{t('edit.label')}</Typography>
              </Box>
            )}

            {deleteClicked && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <TrashIcon
                  onClick={() => deleteClicked(observation)}
                  toolTip={t('observations.delete')}
                />
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
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary'
            }}
          >
            {t('observationType.' + observingMode)}
          </Typography>
        </TableCell>

        {/* Observation ID */}
        <TableCell role="gridcell" sx={{ whiteSpace: 'nowrap' }}>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary'
            }}
          >
            {observation.id}
          </Typography>
        </TableCell>

        {/* Observation Group ID */}
        <TableCell role="gridcell" sx={{ whiteSpace: 'nowrap' }}>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary'
            }}
          >
            {observation.groupId}
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
              sx={{
                color: colorsTelescope.fg[0],
                whiteSpace: 'nowrap',
                p: 1
              }}
            >
              {t('telescopes.' + observation.telescope)}{' '}
              {t('subArrayConfiguration.' + observation.subarray)}
            </Typography>
          </Box>
        </TableCell>

        {/* Observing Band */}
        <TableCell role="gridcell" sx={{ whiteSpace: 'nowrap' }}>
          <ObservingBand
            telescope={telescopeNumber}
            band={observation.observingBand ?? undefined}
          />
        </TableCell>

        {/* Frequency Spectrum */}
        <TableCell>
          <FrequencySpectrum
            actual
            {...spectrumOf(observation, { low: osdLOW, mid: osdMID })}
            bandColor={colorsTelescopeDim.bg[0]}
            bandColorContrast={colorsTelescopeDim.fg[0]}
          />
        </TableCell>
      </TableRow>

      {/* Expanded Row */}
      <TableRow key={`${observation.id}-expanded`}>
        <TableCell sx={{ p: 0 }} colSpan={9} role="gridcell">
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ overflowX: 'hidden' }}>
              <ObservationInfo t={t} observation={observation} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
