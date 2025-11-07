import { TableRow, TableCell, IconButton, Box, Typography, Collapse, Tooltip } from '@mui/material';
import { ChevronRight, ExpandMore } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import EditIcon from '@/components/icon/editIcon/editIcon';
import TrashIcon from '@/components/icon/trashIcon/trashIcon';
import { presentUnits } from '@/utils/present/present';
import { useInitializeAccessStore } from '@/utils/aaa/aaaUtils';

interface TableDataProductsRowProps {
  item: any;
  index: number;
  expanded: boolean;
  deleteClicked?: Function;
  editClicked?: Function;
  toggleRow: (id: number) => void;
  expandButtonRef: (el: HTMLButtonElement | null) => void;
  updateItem: (item: any) => void;
  tableLength: number;
  t: any;
}

export default function TableDataProductsRow({
  item,
  index,
  expanded,
  deleteClicked,
  editClicked,
  toggleRow,
  expandButtonRef,
  updateItem,
  tableLength,
  t
}: TableDataProductsRowProps) {
  const theme = useTheme();
  useInitializeAccessStore();

  React.useEffect(() => {
    if (!item || typeof item.displayRank !== 'number' || !item.decisions) return;

    const newRank = item.displayRank === tableLength ? 0 : item.displayRank;

    if (newRank !== item.decisions.rank) {
      const updatedItem = {
        ...item,
        decisions: {
          ...item.decisions,
          rank: newRank
        }
      };
      updateItem(updatedItem);
    }
  }, [item?.displayRank, tableLength]);

  const getODPString = (inArr: boolean[]) => {
    let str = '';
    for (let i = 0; i < inArr?.length; i++) {
      if (inArr[i]) {
        if (str?.length > 0) {
          str += ', ';
        }
        const res = i + 1;
        const tmp = t('observatoryDataProduct.options.' + res);
        str += tmp;
      }
    }
    return str;
  };

  const tableCollapseCell = () => (
    <TableCell role="gridcell">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflowX: 'hidden' }}>
        <IconButton
          ref={expandButtonRef}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} details for ${
            item.title
          }. ${0} additional details available.`}
          aria-expanded={expanded}
          aria-controls={`employee-details-${item.id}`}
          size="small"
          onClick={() => toggleRow(item.id)}
          data-testid={`expand-button-${item.id}`}
          sx={{
            transition: 'transform 0.2s',
            transform: expanded ? 'rotate(0deg)' : 'rotate(0deg)'
          }}
        >
          {expanded ? <ExpandMore /> : <ChevronRight />}
        </IconButton>
        {false && editClicked !== null && (
          <EditIcon
            onClick={() => (editClicked ? editClicked(item) : null)}
            toolTip="This feature is currently disabled"
          />
        )}
        {deleteClicked !== null && (
          <TrashIcon
            onClick={() => (deleteClicked ? deleteClicked(item) : null)}
            toolTip={t('deleteDataProduct.label')}
          />
        )}
      </Box>
    </TableCell>
  );

  const tableObservationIdCell = () => (
    <TableCell role="gridcell">
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%'
        }}
      >
        {item.observationId}
      </Typography>
    </TableCell>
  );

  const tableDataProductCell = () => (
    <TableCell role="gridcell">
      <Box pt={2}>
        <Tooltip data-testid="odp-values" title={getODPString(item.observatoryDataProduct)} arrow>
          <Typography>{getODPString(item.observatoryDataProduct)}</Typography>
        </Tooltip>
      </Box>
    </TableCell>
  );

  const tableImageSizeCell = () => (
    <TableCell role="gridcell">
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%'
        }}
      >
        {item.imageSizeValue + ' ' + presentUnits(t('imageSize.' + item.imageSizeUnits))}
      </Typography>
    </TableCell>
  );

  const tablePixelSizeCell = () => (
    <TableCell role="gridcell">
      <Typography
        variant="body2"
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%'
        }}
      >
        {item.pixelSizeValue + ' ' + presentUnits(t('pixelSize.' + item.pixelSizeUnits))}
      </Typography>
    </TableCell>
  );

  const tableWeightingCell = () => (
    <TableCell role="gridcell">
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%'
        }}
      >
        {t('imageWeighting.' + item.weighting)}
      </Typography>
    </TableCell>
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
        {tableCollapseCell()}
        {tableObservationIdCell()}
        {tableDataProductCell()}
        {tableImageSizeCell()}
        {tablePixelSizeCell()}
        {tableWeightingCell()}
      </TableRow>

      <TableRow key={`${item.id}-expanded`}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9} role="gridcell">
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ overflowX: 'hidden' }}></Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
