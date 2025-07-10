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
  Grid2
} from '@mui/material';
import { ChevronRight, ExpandMore } from '@mui/icons-material';
import React from 'react';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import SubmitIcon from '@/components/icon/submitIcon/submitIcon';
import ViewIcon from '@/components/icon/viewIcon/viewIcon';
import SubmitButton from '@/components/button/Submit/Submit';
import RankEntryField from '@/components/fields/rankEntryField/RankEntryField';
import { presentDate, presentLatex, presentTime } from '@/utils/present/present';

const FINAL_COMMENTS_HEIGHT = 43; // Height in vh for the final comments field

interface TableReviewDecisionProps {
  data: any;
}

export default function TableReviewDecision({ data }: TableReviewDecisionProps) {
  const { t } = useTranslation('pht');

  const [expandedRows, setExpandedRows] = React.useState<Set<number>>(new Set());
  const expandButtonRefs = React.useRef<{ [key: number]: HTMLButtonElement | null }>({});
  const theme = useTheme();

  React.useEffect(() => {
    console.log('TREVOR', data);
  }, [data]);

  const toggleRow = (id: number) => {
    const newExpandedRows = new Set(expandedRows);
    const wasExpanded = newExpandedRows.has(id);

    if (wasExpanded) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);

    // Announce the state change to screen readers
    const employee = data.find((item: { id: number }) => item.id === id);
    const message = wasExpanded
      ? `Collapsed details for ${employee?.title}`
      : `Expanded details for ${employee?.title}. ${employee?.details.length} additional details available.`;

    // Create a temporary live region for announcements
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const updateComments = (_id: number, _comments: string) => {
    // TODO
  };

  const updateRank = (id: number, rank: number) => {
    // TODO

    // Announce rank change to screen readers
    const employee = data.find((item: { id: number }) => item.id === id);
    const message = `Rank updated to ${rank} out of 9 for ${employee?.title}`;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const handleViewAction = async (_item: any) => {
    // TODO
  };

  const handleSubmitAction = (id: number) => {
    const employee = data.find((item: { id: number }) => item.id === id);

    // TODO

    // Announce to screen readers
    const message = `Employee data submitted for ${employee?.title}`;
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const calculateSuggestedRank = (details: Array<{ rank: number }>) => {
    if (!details || details?.length === 0) return 0;
    const average = details.reduce((sum, detail) => sum + detail.rank, 0) / details.length;
    return Math.round(average);
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <TableContainer
        component={Paper}
        elevation={1}
        role="region"
        aria-label="Employee data table with expandable details"
        data-testid="employee-table"
      >
        <Table sx={{ minWidth: 650 }} aria-label="Employee information table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 50 }}>
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
                  {t('tableReviewDecision.title')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight="bold">
                  {t('tableReviewDecision.reviewStatus')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight="bold">
                  {t('tableReviewDecision.lastUpdated')}
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
            {data.map(
              (
                item: {
                  id: React.Key | null | undefined;
                  scienceCategory: string;
                  title: string;
                  details: any[];
                  reviewStatus:
                    | string
                    | number
                    | boolean
                    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                    | Iterable<React.ReactNode>
                    | React.ReactPortal
                    | null
                    | undefined;
                  lastUpdated: string;
                  rank: number;
                  comments: string;
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
                            item.details?.length
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
                          aria-label={`${item.details?.length} additional details`}
                        >
                          {item.details?.length}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell role="gridcell">
                      <Typography variant="body2" color="text.secondary">
                        {t('scienceCategory.' + item.scienceCategory)}{' '}
                        {/*// TODO + item.reviewStatus)}  */}
                      </Typography>
                    </TableCell>
                    <TableCell role="gridcell">
                      <Typography variant="body2" fontWeight="medium">
                        {presentLatex(item.title)}
                      </Typography>
                    </TableCell>
                    <TableCell role="gridcell">
                      <Typography variant="body2" color="text.secondary">
                        {t('reviewStatus.to do')} {/*// TODO + item.reviewStatus)}  */}
                      </Typography>
                    </TableCell>
                    <TableCell role="gridcell">
                      <Typography variant="body2">
                        {presentDate(item.lastUpdated)} {presentTime(item.lastUpdated)}
                      </Typography>
                    </TableCell>
                    <TableCell role="gridcell">
                      <Typography variant="body2">{item.rank}</Typography>
                    </TableCell>
                    <TableCell role="gridcell">
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <SubmitIcon
                          onClick={() => handleSubmitAction(item.id)}
                          aria-label={`Submit data for ${item.title}`}
                          data-testid={`submit-button-${item.id}`}
                          toolTip="Submit employee data"
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
                        <Box
                          id={`employee-details-${item.id}`}
                          role="region"
                          aria-label={`Additional details for ${item.title}`}
                          data-testid={`employee-details-${item.id}`}
                          sx={{
                            margin: 1,
                            backgroundColor:
                              theme.palette.mode === 'dark'
                                ? theme.palette.grey[900]
                                : theme.palette.grey[50],
                            borderRadius: 1,
                            border: `1px solid ${theme.palette.divider}`,
                            overflow: 'hidden'
                          }}
                        >
                          <Table aria-label={`Review comments and ranks for ${item.title}`}>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>
                                  {t('generalComments.label')}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>
                                  Rank
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', width: '60px' }}>
                                  Action
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {item.details?.map((detail, detailIndex) => (
                                <TableRow key={detailIndex}>
                                  <TableCell
                                    sx={{
                                      borderBottom: `1px solid ${theme.palette.divider}`,
                                      py: 1.5,
                                      px: 2
                                    }}
                                  >
                                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                      {detail.comments}
                                    </Typography>
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      borderBottom: `1px solid ${theme.palette.divider}`,
                                      py: 1.5,
                                      px: 2
                                    }}
                                  >
                                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                      {detail.rank}
                                    </Typography>
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      borderBottom: `1px solid ${theme.palette.divider}`,
                                      py: 1.5,
                                      px: 2
                                    }}
                                  >
                                    <ViewIcon
                                      onClick={() => handleViewAction(item)}
                                      aria-label={`View detail ${detailIndex + 1} for ${
                                        item.title
                                      }`}
                                      data-testid={`view-detail-button-${item.id}-${detailIndex}`}
                                      toolTip="View detail"
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>

                          <Box p={2}>
                            <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                              <Box sx={{ flex: 1 }}>
                                <Stack>
                                  <Grid2
                                    p={2}
                                    container
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    gap={1}
                                  >
                                    <Grid2>
                                      <Typography variant="h6" fontWeight="bold">
                                        General Comments
                                      </Typography>
                                    </Grid2>
                                    <Grid2>
                                      <SubmitButton
                                        action={() => handleSubmitAction(item.id)}
                                        aria-label={`Submit employee data for ${item.title}`}
                                        data-testid={`submit-employee-button-${item.id}`}
                                        disabled={item.rank === 0 || item.comments?.trim() === ''}
                                      />
                                    </Grid2>
                                  </Grid2>
                                  <Box
                                    m={1}
                                    sx={{
                                      maxHeight: `calc('75vh' - 100px)`,
                                      overflowY: 'auto',
                                      width: '100%',
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
                                      title={'decisionComments.label'}
                                      toolTip={'decisionComments.help'}
                                      testId={`comments-${item.id}`}
                                      id={`comments-${item.id}`}
                                      multiline
                                      rows={
                                        ((FINAL_COMMENTS_HEIGHT / 100) * window.innerHeight) / 27
                                      }
                                      value={item.comments}
                                      onChange={(e: { target: { value: string } }) =>
                                        updateComments(item.id, e.target.value)
                                      }
                                      fullWidth
                                      aria-describedby={`comments-help-${item.id}`}
                                      data-testid={`comments-field-${item.id}`}
                                      inputProps={{
                                        'aria-label': `Comments for ${item.title}`
                                      }}
                                    />
                                  </Box>
                                </Stack>
                              </Box>
                              <Box>
                                <RankEntryField
                                  suggestedRank={calculateSuggestedRank(item.details)}
                                  selectedRank={item.rank}
                                  setSelectedRank={(e: { target: { value: any } }) =>
                                    updateRank(item.id, Number(e.target.value))
                                  }
                                />
                              </Box>
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
