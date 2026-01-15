import { TableRow, TableCell, IconButton, Box, Typography } from '@mui/material';
import { ChevronRight, ExpandMore } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@/components/icon/editIcon/editIcon';
import TrashIcon from '@/components/icon/trashIcon/trashIcon';
import { useInitializeAccessStore } from '@/utils/aaa/aaaUtils';

// NOTE
//
// The icon to expand the row is currently hidden (false && ...) because there is no
// content to show in the expanded section yet. Once content is added, this can be
// re-enabled.

interface TableCalibrationsRowProps {
  item: any;
  index: number;
  expanded: boolean;
  deleteClicked?: Function;
  editClicked?: Function;
  toggleRow: (id: number) => void;
  expandButtonRef: (el: HTMLButtonElement | null) => void;
  t: any;
}

export default function TableCalibrationsRow({
  item,
  index,
  expanded,
  deleteClicked,
  editClicked,
  toggleRow,
  expandButtonRef,
  t
}: TableCalibrationsRowProps) {
  const theme = useTheme();
  useInitializeAccessStore();

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
                aria-controls={`calibration-details-${item.id}`}
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
                <EditIcon onClick={() => editClicked(item)} toolTip={t('Calibrations.edit')} />
                <Typography variant="caption">{t('edit.label')}</Typography>
              </Box>
            )}

            {deleteClicked && (
              <Box display="flex" flexDirection="column" alignItems="center">
                <TrashIcon onClick={() => deleteClicked(item)} toolTip={t('Calibrations.delete')} />
                <Typography variant="caption">{t('deleteBtn.label')}</Typography>
              </Box>
            )}
          </Box>
        </TableCell>

        <TableCell role="gridcell" sx={{ whiteSpace: 'nowrap' }}>
          <Typography variant="body2" color="text.secondary">
            {item.id}
          </Typography>
        </TableCell>

        <TableCell role="gridcell" sx={{ whiteSpace: 'nowrap' }}>
          <Typography variant="body2" color="text.secondary">
            {item.id}
          </Typography>
        </TableCell>

        <TableCell role="gridcell" sx={{ whiteSpace: 'nowrap' }}>
          <Typography variant="body2" color="text.secondary">
            {item.id}
          </Typography>
        </TableCell>

        <TableCell role="gridcell" sx={{ whiteSpace: 'nowrap' }}>
          <Typography variant="body2" color="text.secondary">
            {item.id}
          </Typography>
        </TableCell>
      </TableRow>

      {/* Expanded Row */}
      {/* <TableRow key={`${item.id}-expanded`}>
        <TableCell sx={{ p: 0 }} colSpan={9} role="gridcell">
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ overflowX: 'hidden' }}>
              {calibration.rec && <calibrationInfo t={t} calibration={calibration.rec} />}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow> */}
    </>
  );
}
