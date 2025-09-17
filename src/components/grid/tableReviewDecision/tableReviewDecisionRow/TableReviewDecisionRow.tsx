import {
  TableRow,
  TableCell,
  IconButton,
  Box,
  Typography,
  Collapse,
  useTheme
} from '@mui/material';
import { ChevronRight, ExpandMore } from '@mui/icons-material';
import TableTechnicalReviews from '../../tableTechnicalReview/TableTechnicalReviews';
import SubmitIcon from '@/components/icon/submitIcon/submitIcon';
import TableScienceReviews from '@/components/grid/tableScienceReviews/TableScienceReviews';
import DecisionEntry from '@/pages/entry/DecisionEntry/DecisionEntry';
import { presentDate, presentLatex, presentTime } from '@/utils/present/present';
import { REVIEW_TYPE } from '@/utils/constants';

interface TableReviewDecisionRowProps {
  item: any;
  index: number;
  expanded: boolean;
  toggleRow: (id: number) => void;
  expandButtonRef: (el: HTMLButtonElement | null) => void;
  excludeFunction: (detail: any) => void;
  submitFunctionClicked: (item: any) => void;
  updateDecisionItem: (item: any) => void;
  getReviews: (reviews: any[], reviewType: string) => any[];
  getReviewsReviewed: (reviews: any[]) => any[];
  calculateScore: (details: any[]) => number;
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
  submitFunctionClicked,
  updateDecisionItem,
  getReviews,
  getReviewsReviewed,
  calculateScore,
  trimText,
  t
}: TableReviewDecisionRowProps) {
  const theme = useTheme();

  return (
    <>
      <TableRow
        key={item.id}
        sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}
        role="row"
        aria-rowindex={index + 2}
      >
        <TableCell role="gridcell">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
            <Typography variant="caption" color="text.secondary">
              {getReviewsReviewed(item?.reviews)?.length} /{' '}
              {getReviews(item?.reviews, REVIEW_TYPE.SCIENCE)?.length}
            </Typography>
          </Box>
        </TableCell>

        <TableCell role="gridcell">
          <Typography variant="body2" color="text.secondary">
            {t('scienceCategory.' + item.scienceCategory)}
          </Typography>
        </TableCell>

        <TableCell role="gridcell">
          <Typography variant="body2" fontWeight="medium">
            {presentLatex(trimText(item.title, 50))}
          </Typography>
        </TableCell>

        <TableCell role="gridcell">
          <Typography variant="body2" color="text.secondary">
            {item?.decisions?.length > 0
              ? item.decisions[item.decisions.length - 1]?.status
              : t('reviewStatus.to do')}
          </Typography>
        </TableCell>

        <TableCell role="gridcell">
          <Typography variant="body2">
            {presentDate(item.lastUpdated)} {presentTime(item.lastUpdated)}
          </Typography>
        </TableCell>

        <TableCell role="gridcell">
          <Typography variant="body2" color="text.secondary">
            {t(
              getReviews(
                item.reviews,
                REVIEW_TYPE.TECHNICAL
              )?.[0]?.reviewType?.isFeasible?.toLowerCase() ?? ''
            )}
          </Typography>
        </TableCell>

        <TableCell role="gridcell">
          <Typography variant="body2">{calculateScore(item.reviews)}</Typography>
        </TableCell>

        <TableCell role="gridcell">{item.rank}</TableCell>

        <TableCell role="gridcell">
          {item?.decisions[item?.decisions?.length - 1]?.recommendation ?? ''}
        </TableCell>

        <TableCell role="gridcell">
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <SubmitIcon
              onClick={() => submitFunctionClicked(item)}
              aria-label={`Submit data for ${item.title}`}
              data-testid={`submit-button-${item.id}`}
              toolTip={t('decisionSubmit.help')}
            />
          </Box>
        </TableCell>
      </TableRow>

      <TableRow key={`${item.id}-expanded`}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9} role="gridcell">
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <TableTechnicalReviews data={item} />
            <TableScienceReviews data={item} excludeFunction={excludeFunction} />
            <DecisionEntry
              item={item}
              calculateScore={calculateScore}
              submitFunctionClicked={submitFunctionClicked}
              updateItem={updateDecisionItem}
            />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
