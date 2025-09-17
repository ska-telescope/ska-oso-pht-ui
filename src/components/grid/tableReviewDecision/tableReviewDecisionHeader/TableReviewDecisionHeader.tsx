import { TableHead, TableRow, TableCell, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function TableReviewDecisionHeader() {
  const { t } = useTranslation('pht');

  return (
    <TableHead>
      <TableRow>
        <TableCell sx={{ width: 150 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {t('tableReviewDecision.sciReviews')}
          </Typography>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', width: '1%', paddingRight: 2 }}>
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
        <TableCell sx={{ whiteSpace: 'nowrap', width: '1%', paddingRight: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {t('tableReviewDecision.lastUpdated')}
          </Typography>
        </TableCell>
        <TableCell sx={{ width: 60 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {t('tableReviewDecision.feasible')}
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
            {t('tableReviewDecision.recommendation')}
          </Typography>
        </TableCell>
        <TableCell sx={{ width: 120 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {t('tableReviewDecision.actions')}
          </Typography>
        </TableCell>
      </TableRow>
    </TableHead>
  );
}
