import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
  Collapse,
  useTheme,
  Stack,
  Grid
} from '@mui/material';
import { ChevronRight, ExpandMore } from '@mui/icons-material';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import TableTechnicalReviews from '../tableTechnicalReview/TableTechnicalReviews';
import SubmitIcon from '@/components/icon/submitIcon/submitIcon';
import SubmitButton from '@/components/button/Submit/Submit';
import { presentDate, presentLatex, presentTime } from '@/utils/present/present';
import TableScienceReviews from '@/components/grid/tableScienceReviews/TableScienceReviews';
import { PANEL_DECISION_STATUS, REVIEW_TYPE } from '@/utils/constants';

const FINAL_COMMENTS_HEIGHT = 43; // Height in vh for the final comments field

interface TableReviewDecisionProps {
  data: any;
  excludeFunction: (detail: any) => void;
  submitFunction: (item: any) => void;
}

export default function TableReviewDecision({
  data,
  excludeFunction,
  submitFunction
}: TableReviewDecisionProps) {
  const { t } = useTranslation('pht');
  const theme = useTheme();

  const expandButtonRefs = React.useRef<{ [key: number]: HTMLButtonElement | null }>({});

  const [expandedRows, setExpandedRows] = React.useState(new Set<number>());

  const submitFunctionClicked = (item: any) => {
    submitFunction(item);
  };

  const getReviewsReviewed = (reviews: any[]) => {
    const results =
      getReviews(reviews, REVIEW_TYPE.SCIENCE)?.filter(el => {
        return el?.status === PANEL_DECISION_STATUS.REVIEWED;
      }) ?? [];
    return results;
  };

  const getReviews = (reviews: any[], reviewType: string) => {
    const results =
      reviews?.filter(el => {
        return el?.reviewType?.kind === reviewType;
      }) ?? [];
    return results;
  };

  const toggleRow = (id: number) => {
    const newExpandedRows = new Set(expandedRows);
    const wasExpanded = newExpandedRows.has(id);

    if (wasExpanded) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const calculateScore = (details: Array<any>) => {
    if (!details || details?.length === 0) return 0;
    const filtered = details.filter(
      el => el?.reviewType?.excludedFromDecision === false && el?.status !== 'To Do'
    );
    if (filtered?.length === 0) return 0;
    const average =
      filtered.reduce((sum, detail) => sum + detail?.reviewType?.rank, 0) / filtered?.length;
    return Math.round((average + Number.EPSILON) * 100) / 100;
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <TableContainer
        component={Paper}
        elevation={1}
        role="region"
        aria-label="Review data table with expandable details"
        data-testid="review-table"
      >
        <Table sx={{ minWidth: 650 }} aria-label="Employee information table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 150 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {t('tableReviewDecision.sciReviews')}
                </Typography>
              </TableCell>
              <TableCell sx={{ width: 60 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {t('tableReviewDecision.feasible')}
                </Typography>
              </TableCell>
              <TableCell sx={{ width: 120 }}>
                <Typography variant="subtitle2" fontWeight="bold" className="sr-only">
                  {t('scienceCategory.label')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight="bold">
                  {t('tableReviewDecision.title')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight="bold">
                  {t('tableReviewDecision.decisionStatus')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight="bold">
                  {t('tableReviewDecision.lastUpdated')}
                </Typography>
              </TableCell>
              <TableCell sx={{ width: 120 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {t('tableReviewDecision.decisionScore')}
                </Typography>
              </TableCell>
              <TableCell sx={{ width: 120 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {t('tableReviewDecision.rank')}
                </Typography>
              </TableCell>
              <TableCell sx={{ width: 120 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {t('tableReviewDecision.actions')}
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data && Array.isArray(data) ? data : []).map(
              (
                item: {
                  id: number;
                  scienceCategory: string;
                  title: string;
                  details: any[];
                  reviewStatus: string;
                  lastUpdated: string;
                  rank: number;
                  comments: string;
                  reviews: any[];
                  [key: string]: any;
                },
                index: number
              ) => (
                <>
                  <TableRow
                    key={item.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover
                      }
                    }}
                    role="row"
                    aria-rowindex={index + 2}
                  >
                    <TableCell role="gridcell">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          ref={el => (expandButtonRefs.current[item.id] = el)}
                          aria-label={`${
                            expandedRows.has(item.id) ? 'Collapse' : 'Expand'
                          } details for ${item.title}. ${
                            getReviews(item?.reviews, REVIEW_TYPE.SCIENCE)?.length
                          } additional details available.`}
                          aria-expanded={expandedRows.has(item.id)}
                          aria-controls={`employee-details-${item.id}`}
                          size="small"
                          onClick={() => toggleRow(item.id)}
                          data-testid={`expand-button-${item.id}`}
                          sx={{
                            transition: 'transform 0.2s',
                            transform: expandedRows.has(item.id) ? 'rotate(0deg)' : 'rotate(0deg)'
                          }}
                        >
                          {expandedRows.has(item.id) ? <ExpandMore /> : <ChevronRight />}
                        </IconButton>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          aria-label={`${
                            getReviews(item?.reviews, REVIEW_TYPE.SCIENCE)?.length
                          } additional details`}
                        >
                          {getReviewsReviewed(item?.reviews)?.length}
                          {' / '}
                          {getReviews(item?.reviews, REVIEW_TYPE.SCIENCE)?.length}
                        </Typography>
                      </Box>
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
                      <Typography variant="body2" color="text.secondary">
                        {t('scienceCategory.' + item.scienceCategory)}
                      </Typography>
                    </TableCell>
                    <TableCell role="gridcell">
                      <Typography variant="body2" fontWeight="medium">
                        {presentLatex(item.title)}
                      </Typography>
                    </TableCell>
                    <TableCell role="gridcell">
                      <Typography variant="body2" color="text.secondary">
                        {item?.decisions?.length > 0
                          ? item.decisions[item?.decisions?.length - 1]?.status
                          : t('reviewStatus.to do')}
                      </Typography>
                    </TableCell>
                    <TableCell role="gridcell">
                      <Typography variant="body2">
                        {presentDate(item.lastUpdated)} {presentTime(item.lastUpdated)}
                      </Typography>
                    </TableCell>
                    <TableCell role="gridcell">
                      <Typography variant="body2">{calculateScore(item.reviews)}</Typography>
                    </TableCell>
                    <TableCell role="gridcell">{item.rank}</TableCell>
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
                    <TableCell
                      style={{ paddingBottom: 0, paddingTop: 0 }}
                      colSpan={9}
                      role="gridcell"
                    >
                      <Collapse in={expandedRows.has(item.id)} timeout="auto" unmountOnExit>
                        <TableTechnicalReviews data={item} />
                        <TableScienceReviews data={item} excludeFunction={excludeFunction} />

                        <Box p={2}>
                          <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Stack>
                                <Grid
                                  p={2}
                                  container
                                  direction="row"
                                  alignItems="center"
                                  justifyContent="space-between"
                                  gap={1}
                                >
                                  <Grid>
                                    <Typography variant="h6" fontWeight="bold">
                                      {t('tableReviewDecision.decisionComments')}
                                    </Typography>
                                  </Grid>
                                  <Grid>
                                    <Typography variant="h6">
                                      {`${t('tableReviewDecision.decisionScore')} ${calculateScore(
                                        item.reviews
                                      )}`}
                                    </Typography>
                                  </Grid>
                                  <Grid>
                                    <SubmitButton
                                      action={() => submitFunctionClicked(item)}
                                      aria-label={`Submit review data for ${item.title}`}
                                      data-testid={`submit-review-button-${item.id}`}
                                      toolTip="decisionSubmit.help"
                                    />
                                  </Grid>
                                </Grid>
                                <Box
                                  m={1}
                                  sx={{
                                    maxHeight: `calc(75vh - 100px)`,
                                    overflowY: 'auto',
                                    width: '99%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backgroundColor: 'white',
                                    borderColor: 'divider',
                                    borderWidth: 1,
                                    borderStyle: 'solid',
                                    borderRadius: 2
                                  }}
                                >
                                  <TextEntry
                                    label={''}
                                    testId="finalCommentsId"
                                    rows={((FINAL_COMMENTS_HEIGHT / 100) * window.innerHeight) / 27}
                                    setValue={(val: string) => {
                                      item.recommendation = val;
                                    }}
                                    value={item.recommendation}
                                  />
                                </Box>
                              </Stack>
                            </Box>
                          </Box>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </>
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
