import { TableHead, TableRow, TableCell, Typography } from '@mui/material';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

export default function TableReviewDecisionHeader() {
  const { t } = useScopedTranslation();

  return (
    <TableHead>
      <TableRow>
        <TableCell sx={{ whiteSpace: 'nowrap', width: '1%', paddingRight: 2 }}>
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
        <TableCell sx={{ whiteSpace: 'nowrap', width: '1%', paddingRight: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {t('tableReviewDecision.decisionStatus')}
          </Typography>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', width: '1%', paddingRight: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {t('tableReviewDecision.lastUpdated')}
          </Typography>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', width: '1%', paddingRight: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {t('tableReviewDecision.feasible')}
          </Typography>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', width: '1%', paddingRight: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {t('tableReviewDecision.decisionScore')}
          </Typography>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', width: '1%', paddingRight: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {t('tableReviewDecision.rank')}
          </Typography>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', width: '2%', paddingRight: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {t('recommendations.label')}
          </Typography>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', width: '1%', paddingRight: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {t('tableReviewDecision.actions')}
          </Typography>
        </TableCell>
      </TableRow>
    </TableHead>
  );
}
