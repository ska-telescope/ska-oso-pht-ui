import { TableRow, TableCell, IconButton, Box, Typography, Collapse } from '@mui/material';
import { ChevronRight, ExpandMore } from '@mui/icons-material';
import { DropDown } from '@ska-telescope/ska-gui-components';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { useNavigate } from 'react-router-dom';
import TableTechnicalReviews from '../../tableTechnicalReview/TableTechnicalReviews';
import CollapsibleObservation from '../CollapsibleObservation';
import SubmitIcon from '@/components/icon/submitIcon/submitIcon';
import TableScienceReviews from '@/components/grid/tableScienceReviews/TableScienceReviews';
import { presentDate, presentLatex, presentTime } from '@/utils/present/present';
import {
  BANDWIDTH_TELESCOPE,
  PATH,
  RECOMMENDATION,
  RECOMMENDATION_STATUS_DECIDED,
  RECOMMENDATION_STATUS_IN_PROGRESS,
  REVIEW_TYPE
} from '@/utils/constants';
import { isReviewerAdminOnly, useInitializeAccessStore } from '@/utils/aaa/aaaUtils';
import GroupObservation from '@/utils/types/groupObservation';
import Proposal from '@/utils/types/proposal';
import ObservationEntry from '@/pages/entry/ObservationEntry/ObservationEntry';
import EditIcon from '@/components/icon/editIcon/editIcon';
import TrashIcon from '@/components/icon/trashIcon/trashIcon';

interface TableObservationRowProps {
  item: any;
  index: number;
  expanded: boolean;
  toggleRow: (id: number) => void;
  expandButtonRef: (el: HTMLButtonElement | null) => void;
  t: any;
  deleteIconClicked: Function;
}

export default function TableObservationRow({
  item,
  index,
  expanded,
  toggleRow,
  expandButtonRef,
  t,
  deleteIconClicked
}: TableObservationRowProps) {
  const theme = useTheme();
  useInitializeAccessStore();
  const navigate = useNavigate();
  const { application } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;

  const observationGroupIds = (id: string) => {
    if (
      getProposal()?.groupObservations &&
      getProposal()?.groupObservations?.some(e => e.observationId === id)
    ) {
      const group: GroupObservation[] =
        getProposal().groupObservations?.filter(e => e.observationId === id) ?? [];
      return group[0]?.groupId;
    }
    return '';
  };

  const editIconClicked = (row: any) => {
    navigate(PATH[2], { replace: true, state: row.rec });
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

            {/* {false && editClicked && (
                  <EditIcon
                    onClick={() => {
                      if (editClicked) editClicked(item);
                    }}
                    toolTip="This feature is currently disabled"
                  />
                )}
        
                {deleteClicked && (
                  <TrashIcon onClick={() => deleteClicked(item)} toolTip={t('deleteDataProduct.label')} />
                )} */}
          </Box>
        </TableCell>
        <TableCell role="gridcell">
          <Box sx={{ display: 'flex', gap: 0.5, msOverflowX: 'hidden' }}>
            <EditIcon onClick={() => editIconClicked(item)} toolTip={t('observations.edit')} />
            <TrashIcon onClick={deleteIconClicked(item)} toolTip={t('observations.delete')} />
          </Box>
        </TableCell>

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
            {t(`observationType.${item.type}`)}
          </Typography>
        </TableCell>

        <TableCell role="gridcell">
          <Typography
            variant="body2"
            fontWeight="medium"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%'
            }}
          >
            {item.id}
          </Typography>
        </TableCell>

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
            {observationGroupIds(item.id)}
          </Typography>
        </TableCell>

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
            {t(`subArrayConfiguration.${item.subarray}`)}
          </Typography>
        </TableCell>

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
            {BANDWIDTH_TELESCOPE[Number(item.rec.observingBand)]?.label}
          </Typography>
        </TableCell>
        {/* <TableCell role="gridcell">
          <Box sx={{ display: 'flex', alignItems: 'end', gap: 1, overflowX: 'hidden' }}>
            <IconButton
              ref={expandButtonRef}
              aria-expanded={expanded}
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
          </Box>
        </TableCell> */}
      </TableRow>

      <TableRow key={`${item.id}-expanded`}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9} role="gridcell">
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ overflowX: 'hidden' }}>
              <CollapsibleObservation obs={item}></CollapsibleObservation>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
