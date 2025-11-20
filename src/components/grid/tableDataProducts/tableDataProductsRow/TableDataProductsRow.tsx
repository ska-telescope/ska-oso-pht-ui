import { TableRow, TableCell, IconButton, Box, Typography, Collapse } from '@mui/material';
import { ChevronRight, ExpandMore } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@/components/icon/editIcon/editIcon';
import TrashIcon from '@/components/icon/trashIcon/trashIcon';
import { useInitializeAccessStore } from '@/utils/aaa/aaaUtils';
import Proposal from '@/utils/types/proposal';
import { getColors } from '@/utils/colors/colors';
import FrequencySpectrum from '@/components/fields/frequencySpectrum/frequencySpectrum';
import { FREQUENCY_HZ, FREQUENCY_MHZ, TYPE_CONTINUUM } from '@/utils/constants';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import DataProduct from '@/components/info/dataProduct/DataProduct';
import { frequencyConversion } from '@/utils/helpers';

interface TableDataProductsRowProps {
  item: any;
  index: number;
  proposal: Proposal;
  expanded: boolean;
  deleteClicked?: Function;
  editClicked?: Function;
  toggleRow: (id: number) => void;
  expandButtonRef: (el: HTMLButtonElement | null) => void;
  t: any;
}

export default function TableDataProductsRow({
  item,
  index,
  proposal,
  expanded,
  deleteClicked,
  editClicked,
  toggleRow,
  expandButtonRef,
  t
}: TableDataProductsRowProps) {
  const theme = useTheme();
  const { osdLOW } = useOSDAccessors();
  useInitializeAccessStore();

  const getObservation = () => proposal?.observations?.find(obs => obs.id === item.observationId);

  const isContinuum = () => getObservation()?.type === TYPE_CONTINUUM;

  const tableCollapseCell = () => (
    <TableCell role="gridcell" style={{ maxWidth: '120px', padding: 0 }}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          maxWidth: '100%',
          overflow: 'hidden'
        }}
      >
        <IconButton
          ref={expandButtonRef}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} details for ${item.title}.`}
          aria-expanded={expanded}
          aria-controls={`employee-details-${item.id}`}
          size="small"
          onClick={() => toggleRow(item.id)}
          data-testid={`expand-button-${item.id}`}
          sx={{ transition: 'transform 0.2s' }}
        >
          {expanded ? <ExpandMore /> : <ChevronRight />}
        </IconButton>

        {editClicked && (
          <EditIcon
            onClick={() => {
              if (editClicked) editClicked(item);
            }}
            toolTip={t('editDataProduct.toolTip')}
          />
        )}

        {deleteClicked && (
          <TrashIcon onClick={() => deleteClicked(item)} toolTip={t('deleteDataProduct.toolTip')} />
        )}
      </Box>
    </TableCell>
  );

  const tableObservationIdCell = () => (
    <TableCell role="gridcell" sx={{ width: 0, whiteSpace: 'nowrap', minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
        {item.observationId}
      </Typography>
    </TableCell>
  );

  const tableObservationTypeCell = () => {
    const colors = getColors({
      type: 'observationType',
      colors: getObservation()?.type?.toString() ?? '',
      content: 'both'
    });
    return (
      <TableCell
        role="gridcell"
        sx={{
          borderLeft: '10px solid',
          borderColor: colors[0],
          paddingLeft: '10px',
          width: '1%',
          whiteSpace: 'nowrap',
          minWidth: 0
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          {t('observationType.' + getObservation()?.type)}
        </Typography>
      </TableCell>
    );
  };

  const tableObservationSubarrayCell = () => {
    const colors = getColors({
      type: 'telescope',
      colors: getObservation()?.telescope.toString() ?? '',
      content: 'both'
    });
    return (
      <TableCell role="gridcell" sx={{ width: '1%', whiteSpace: 'nowrap', minWidth: 0 }}>
        <Box
          sx={{
            backgroundColor: colors[0],
            borderRadius: '8px',
            padding: '4px 8px',
            display: 'inline-flex'
          }}
        >
          <Typography variant="body2" color={colors[1]} sx={{ whiteSpace: 'nowrap', padding: 1 }}>
            {t('telescopes.' + getObservation()?.telescope)}{' '}
            {t('subArrayConfiguration.' + getObservation()?.subarray)}
          </Typography>
        </Box>
      </TableCell>
    );
  };

  const tableObservationBandCell = () => {
    const colors = getColors({
      type: 'telescope',
      colors: getObservation()?.telescope.toString() ?? '',
      content: 'both',
      dim: 0.6
    });
    return (
      <TableCell role="gridcell" sx={{ width: '1%', whiteSpace: 'nowrap', minWidth: 0 }}>
        <Box
          sx={{
            backgroundColor: colors[0],
            borderRadius: '0px',
            padding: '4px 8px',
            display: 'inline-flex'
          }}
        >
          <Typography variant="body2" color={colors[1]} sx={{ whiteSpace: 'nowrap', padding: 1 }}>
            {t('observingBand.short.' + getObservation()?.observingBand)}
          </Typography>
        </Box>
      </TableCell>
    );
  };

  const tableObservationFrequencySpectrumCell = () => {
    const colors = getColors({
      type: 'telescope',
      colors: getObservation()?.telescope.toString() ?? '',
      content: 'both',
      dim: 0.6
    });
    return (
      <TableCell>
        {true && (
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
              getObservation()?.centralFrequency ?? 0,
              getObservation()?.centralFrequencyUnits ?? FREQUENCY_HZ,
              FREQUENCY_MHZ
            )}
            bandWidth={
              isContinuum()
                ? getObservation()?.continuumBandwidth ?? 0
                : getObservation()?.bandwidth ?? 0
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
            bandColor={colors[0]}
            bandColorContrast={colors[1]}
          />
        )}
      </TableCell>
    );
  };

  return (
    <>
      <TableRow
        key={item.id}
        data-testid={`row-${item.id}`}
        sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}
        role="row"
        aria-rowindex={index + 2}
      >
        {tableCollapseCell()}
        {tableObservationTypeCell()}
        {tableObservationIdCell()}
        {tableObservationSubarrayCell()}
        {tableObservationBandCell()}
        {tableObservationFrequencySpectrumCell()}
      </TableRow>

      <TableRow key={`${item.id}-expanded`}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9} role="gridcell">
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ overflowX: 'hidden' }}>
              <DataProduct t={t} data={item} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
