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

interface TableObservationRowProps {
  item: any;
  obsItem: any;
  index: number;
  expanded: boolean;
  toggleRow: (id: number) => void;
  expandButtonRef: (el: HTMLButtonElement | null) => void;
  excludeFunction: (detail: any) => void;
  updateDecisionItem: (item: any) => void;
  getReviews: (reviews: any[], reviewType: string) => any[];
  getReviewsReviewed: (reviews: any[]) => any[];
  calculateScore: (details: any[]) => number;
  tableLength: number;
  trimText: (text: string, maxLength: number) => string;
  t: any;
}

export default function TableObservationRow({
  item,
  index,
  expanded,
  toggleRow,
  expandButtonRef,
  excludeFunction,
  updateDecisionItem,
  getReviews,
  getReviewsReviewed,
  calculateScore,
  tableLength,
  trimText,
  t
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
    // setCurrObs(row.rec);
    navigate(PATH[2], { replace: true, state: row.rec });
  };

  const deleteIconClicked = (row: any) => {
    // setCurrObs(row.rec);
    setOpenDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    // setOpenDeleteDialog(false);
  };

  // React.useEffect(() => {
  //   if (!item || typeof item.displayRank !== 'number' || !item.decisions) return;

  //   const newRank = item.displayRank === tableLength ? 0 : item.displayRank;

  //   if (newRank !== item.decisions.rank) {
  //     const updatedItem = {
  //       ...item,
  //       decisions: {
  //         ...item.decisions,
  //         rank: newRank
  //       }
  //     };
  //     updateDecisionItem(updatedItem);
  //   }
  // }, [item?.displayRank, tableLength]);

  return (
    <>
      <TableRow
        key={item.id}
        data-testid={`row-${item.id}`}
        sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}
        role="row"
        aria-rowindex={index + 2}
      >
        <TableCell role="gridcell">
          <Box sx={{ display: 'flex', gap: 0.5, msOverflowX: 'hidden' }}>
            <EditIcon onClick={() => editIconClicked(item)} toolTip={t('observations.edit')} />
            <EditIcon onClick={() => editIconClicked(item)} toolTip={t('observations.edit')} />
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
        <TableCell role="gridcell">
          <Box sx={{ display: 'flex', alignItems: 'end', gap: 1, overflowX: 'hidden' }}>
            <IconButton
              ref={expandButtonRef}
              // aria-label={`${expanded ? 'Collapse' : 'Expand'} details for ${item.id}. ${
              //   getReviews(item?.reviews, REVIEW_TYPE.SCIENCE)?.length
              // } additional details available.`}
              aria-expanded={expanded}
              // aria-controls={`employee-details-${item.id}`}
              size="small"
              onClick={() => toggleRow(item.id)}
              data-testid={`expand-button-${item.id}`}
              sx={{
                transition: 'transform 0.2s',
                transform: expanded ? 'rotate(0deg)' : 'rotate(0deg)',
              }}
            >
              {expanded ? <ExpandMore /> : <ChevronRight />}
            </IconButton>
            {/* <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%'
              }}
            >
              {getReviewsReviewed(item?.reviews)?.length} /{' '}
              {getReviews(item?.reviews, REVIEW_TYPE.SCIENCE)?.length}
            </Typography> */}
          </Box>
        </TableCell>
      </TableRow>

      <TableRow key={`${item.id}-expanded`}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9} role="gridcell">
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ overflowX: 'hidden' }}>
              {/* <TableTechnicalReviews data={item} />
              <TableScienceReviews data={item} excludeFunction={excludeFunction} /> */}
              <ObservationEntry></ObservationEntry>
              <CollapsibleObservation obs={item}></CollapsibleObservation>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
