import { TableRow, TableCell, Box, Typography, Collapse } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { getColors } from '@ska-telescope/ska-gui-components';
import { FrequencySpectrum } from '@ska-telescope/ska-gui-components';
import EditIcon from '@/components/icon/editIcon/editIcon';
import TrashIcon from '@/components/icon/trashIcon/trashIcon';
import { useInitializeAccessStore } from '@/utils/aaa/aaaUtils';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import DataProductDisplay from '@/components/info/dataProduct/DataProductDisplay';
import ExpandIcon from '@/components/icon/expandIcon/expandIcon';
import ObservingBand from '@/components/display/observingBand/observingBand';
import {
  OBSERVING_MODE_TRANSLATION_KEY,
  spectrumOf,
  TELESCOPE_NUMBER,
  type ObservationInput
} from '@/models/proposals/observations';

interface TableDataProductsRowProps {
  item: any;
  index: number;
  observation: ObservationInput | undefined;
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
  observation,
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

  const observingMode = observation && OBSERVING_MODE_TRANSLATION_KEY[observation.observingMode];
  const telescopeNumber = observation && TELESCOPE_NUMBER[observation.telescope];

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
        key={Number(item.id)}
        data-testid={`row-${item.id}`}
        sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}
        role="row"
        aria-rowindex={index + 2}
      >
        {/* Collapse / Edit / Delete */}
        <TableCell role="gridcell" sx={{ maxWidth: 120, p: 0 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
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
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <EditIcon
                  onClick={() => editClicked(item)}
                  toolTip={t('editDataProduct.toolTip')}
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
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary'
            }}
          >
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
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary'
              }}
            >
              {t('observationType.' + observingMode)}
            </Typography>
          </Box>
        </TableCell>

        {/* Observation ID */}
        <TableCell role="gridcell" sx={{ whiteSpace: 'nowrap' }}>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary'
            }}
          >
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
              sx={{
                color: colorsTelescope.fg[0],
                whiteSpace: 'nowrap',
                p: 1
              }}
            >
              {t('telescopes.' + observation?.telescope)}{' '}
              {t('subArrayConfiguration.' + observation?.subarray)}
            </Typography>
          </Box>
        </TableCell>

        {/* Observing Band */}
        <TableCell role="gridcell" sx={{ whiteSpace: 'nowrap' }}>
          <ObservingBand
            telescope={String(telescopeNumber)}
            band={observation?.observingBand ?? undefined}
          />
        </TableCell>

        {/* Frequency Spectrum */}
        <TableCell>
          {observation && (
            <FrequencySpectrum
              actual
              {...spectrumOf(observation, { low: osdLOW, mid: osdMID })}
              bandColor={colorsTelescopeDim.bg[0]}
              bandColorContrast={colorsTelescopeDim.fg[0]}
            />
          )}
        </TableCell>
      </TableRow>

      {/* Expanded Row */}
      <TableRow key={`${item.id}-expanded`}>
        <TableCell sx={{ p: 0 }} colSpan={9} role="gridcell">
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ overflowX: 'hidden' }}>
              {observation && <DataProductDisplay t={t} dataProduct={item} />}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
