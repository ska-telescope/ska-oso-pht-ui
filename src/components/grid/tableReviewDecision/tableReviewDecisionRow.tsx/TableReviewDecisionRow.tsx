import { TableRow, TableCell, IconButton, Box, Typography, Collapse } from '@mui/material';
import { ChevronRight, ExpandMore } from '@mui/icons-material';
import { DropDown } from '@ska-telescope/ska-gui-components';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import TableTechnicalReviews from '../../tableTechnicalReview/TableTechnicalReviews';
import SubmitIcon from '@/components/icon/submitIcon/submitIcon';
import TableScienceReviews from '@/components/grid/tableScienceReviews/TableScienceReviews';
import { presentDate, presentLatex, presentTime } from '@/utils/present/present';
import {
  RECOMMENDATION,
  RECOMMENDATION_STATUS_DECIDED,
  RECOMMENDATION_STATUS_IN_PROGRESS,
  REVIEW_TYPE
} from '@/utils/constants';
import { isReviewerAdminOnly, useInitializeAccessStore } from '@/utils/aaa/aaaUtils';
import { useAppFlow } from '@/utils/appFlow/AppFlowContext';

interface TableReviewDecisionRowProps {
  item: any;
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

export default function TableReviewDecisionRow({
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
}: TableReviewDecisionRowProps) {
  const theme = useTheme();
  useInitializeAccessStore();
  const { isSV } = useAppFlow();

  const getFeasibility = () => {
    const reviews = getReviews(item.reviews, REVIEW_TYPE.TECHNICAL);
    const str = reviews?.[0]?.reviewType?.isFeasible?.toLowerCase() ?? '';
    return str.length ? t(str) : '';
  };

  const hasRecommendation = (el: string) =>
    el === RECOMMENDATION[0] || el === RECOMMENDATION[1] || el === RECOMMENDATION[2];

  const getOptions = () => RECOMMENDATION.map(e => ({ label: e, value: e }));

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
      updateDecisionItem(updatedItem);
    }
  }, [item?.displayRank, tableLength]);

  const tableActionsCell = () => (
    <TableCell role="gridcell">
      <Box sx={{ display: 'flex', gap: 0.5, msOverflowX: 'hidden' }}>
        <SubmitIcon
          disabled={
            isReviewerAdminOnly() ||
            !hasRecommendation(item?.decisions?.recommendation) ||
            item?.decisions?.status === RECOMMENDATION_STATUS_DECIDED
          }
          onClick={() => {
            const rec = item;
            rec.decisions.status = RECOMMENDATION_STATUS_DECIDED;
            updateDecisionItem(rec);
          }}
          aria-label={`Submit data for ${item.title}`}
          data-testid={`submit-button-${item.id}`}
          toolTip={t('decisionSubmit.help')}
        />
      </Box>
    </TableCell>
  );

  const tableCollapseCell = () => (
    <TableCell role="gridcell">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflowX: 'hidden' }}>
        <IconButton
          ref={expandButtonRef}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} details for ${item.title}. ${
            getReviews(item?.reviews, REVIEW_TYPE.SCIENCE)?.length
          } additional details available.`}
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
        <Typography
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
        </Typography>
      </Box>
    </TableCell>
  );

  const tableCategoryCell = () => (
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
        {t('scienceCategory.' + item.scienceCategory)}
      </Typography>
    </TableCell>
  );

  const tableTitleCell = () => (
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
        {presentLatex(trimText(item.title, 50))}
      </Typography>
    </TableCell>
  );
  const tableReviewStatusCell = () => (
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
        {item?.decisions?.status ?? t('reviewStatus.to do')}
      </Typography>
    </TableCell>
  );

  const tableLastUpdatedCell = () => (
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
        {presentDate(item.lastUpdated)} {presentTime(item.lastUpdated)}
      </Typography>
    </TableCell>
  );

  const tableFeasibilityCell = () => (
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
        {getFeasibility()}
      </Typography>
    </TableCell>
  );

  const tableScoreCell = () => (
    <TableCell
      role="gridcell"
      sx={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: '100%'
      }}
    >
      <Typography variant="body2">{calculateScore(item.reviews)}</Typography>
    </TableCell>
  );

  const tableRankCell = () => (
    <TableCell role="gridcell" data-testid={`rank-${item.id}`}>
      {item.displayRank}
    </TableCell>
  );

  const tableRecommendationCell = () => (
    <TableCell role="gridcell">
      <Box sx={{ maxWidth: 200, overflowX: 'hidden' }}>
        <DropDown
          disabled={
            isReviewerAdminOnly() || item?.decisions?.status === RECOMMENDATION_STATUS_DECIDED
          }
          label={''}
          options={getOptions()}
          required
          setValue={(val: string) => {
            const rec = item;
            rec.decisions.recommendation = val;
            rec.decisions.status = RECOMMENDATION_STATUS_IN_PROGRESS;
            updateDecisionItem(rec);
          }}
          testId={'recommendationDropdown'}
          value={item?.decisions?.recommendation ?? ''}
        />
      </Box>
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
        {tableCategoryCell()}
        {tableTitleCell()}
        {tableReviewStatusCell()}
        {tableLastUpdatedCell()}
        {tableFeasibilityCell()}
        {tableScoreCell()}
        {tableRankCell()}
        {tableRecommendationCell()}
        {tableActionsCell()}
      </TableRow>

      <TableRow key={`${item.id}-expanded`}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9} role="gridcell">
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ overflowX: 'hidden' }}>
              {<TableTechnicalReviews data={item} />}
              <TableScienceReviews data={item} excludeFunction={excludeFunction} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
