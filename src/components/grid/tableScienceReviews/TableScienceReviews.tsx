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
  useTheme,
  Grid
} from '@mui/material';
import { Key } from 'react';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { PANEL_DECISION_STATUS, REVIEW_TYPE } from '@/utils/constants';
import { ScienceReview } from '@/utils/types/proposalReview';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { isReviewerAdminOnly } from '@/utils/aaa/aaaUtils';

const STATUS_SIZE = 30;

interface TableScienceReviewsProps {
  data: any;
  excludeFunction: (detail: any) => void;
}

export default function TableScienceReviews({ data, excludeFunction }: TableScienceReviewsProps) {
  const { t } = useScopedTranslation();
  const theme = useTheme();

  const filteredData = (reviews: any[]) =>
    reviews.filter(el => el?.reviewType?.kind === REVIEW_TYPE.SCIENCE);

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <TableContainer
        component={Paper}
        elevation={1}
        role="region"
        aria-label="Employee data table with expandable details"
        data-testid="employee-table"
      >
        <Table aria-label={`Review comments and ranks for ${data.title}`}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '60px' }}>{t('status.label')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('generalComments.label')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('srcNetComments.label')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '60px' }}>
                {t('conflict.column')}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>{t('rank.label')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '60px' }}>
                {t('tableReviewDecision.excluded')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData(data.reviews)?.map(
              (
                detail: {
                  status: string;
                  comments: string;
                  srcNet: string;
                  reviewType: ScienceReview;
                },
                detailIndex: Key | null | undefined
              ) => (
                <TableRow key={detailIndex}>
                  <TableCell
                    sx={{
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      py: 1.5,
                      px: 2
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      {detail?.status}
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
                      {detail.srcNet}
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
                      {detail.reviewType.conflict.hasConflict ? t('yes') : ''}
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
                      {detail.reviewType.rank}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      py: 1.5,
                      px: 2
                    }}
                  >
                    <Grid container direction="row" alignItems="center" gap={1} wrap="nowrap">
                      <Grid>
                        <IconButton
                          onClick={() =>
                            detail.status === PANEL_DECISION_STATUS.TO_DO
                              ? null
                              : excludeFunction(detail)
                          }
                          style={{ cursor: 'hand' }}
                          disabled={isReviewerAdminOnly() || detail.reviewType.conflict.hasConflict}
                        >
                          <StatusIcon
                            testId={`includeIcon-${data.id}-${detailIndex}`}
                            softColors={detail.reviewType.conflict.hasConflict}
                            icon
                            level={
                              detail.status === PANEL_DECISION_STATUS.TO_DO ||
                              detail.reviewType.excludedFromDecision ||
                              detail.reviewType.conflict.hasConflict
                                ? 1
                                : 0
                            }
                            size={STATUS_SIZE}
                            iconOffset={0}
                            iconSizingFactor={1}
                          />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
