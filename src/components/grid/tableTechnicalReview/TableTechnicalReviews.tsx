import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  useTheme
} from '@mui/material';
import { Key } from 'react';
import { REVIEW_TYPE } from '@/utils/constants';
import { TechnicalReview } from '@/utils/types/proposalReview';

interface TableTechnicalReviewsProps {
  data: any;
}

export default function TableTechnicalReviews({ data }: TableTechnicalReviewsProps) {
  const { t } = useTranslation('pht');
  const theme = useTheme();

  const filteredData = (reviews: any[]) =>
    reviews.filter(el => el?.reviewType?.kind === REVIEW_TYPE.TECHNICAL);

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
              <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>{t('status.label')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>
                {t('feasibility.label')}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('technicalComments.label')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData(data.reviews)?.map(
              (
                detail: {
                  status: string;
                  reviewType: TechnicalReview;
                },
                detailIndex: Key | null | undefined
              ) => (
                <TableRow
                  key={detailIndex}
                  sx={{
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    py: 1.5,
                    px: 2
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      {detail?.status}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      {detail?.reviewType?.feasibility?.isFeasible}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      {detail?.reviewType?.feasibility?.comments}
                    </Typography>
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
