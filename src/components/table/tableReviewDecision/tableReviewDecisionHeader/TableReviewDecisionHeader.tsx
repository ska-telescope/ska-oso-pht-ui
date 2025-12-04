import { TableHead, TableRow, TableCell, Typography } from '@mui/material';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

export default function TableReviewDecisionHeader() {
  const { t } = useScopedTranslation();

  const displayHeader = (inValue: string) => (
    <TableCell sx={{ whiteSpace: 'nowrap', width: '1%', paddingRight: 2 }}>
      <Typography variant="subtitle2" fontWeight="bold">
        {t(inValue)}
      </Typography>
    </TableCell>
  );

  return (
    <TableHead>
      <TableRow>
        {displayHeader('tableReviewDecision.sciReviews')}
        {displayHeader('scienceCategory.label')}
        {displayHeader('tableReviewDecision.title')}
        {displayHeader('tableReviewDecision.decisionStatus')}
        {displayHeader('tableReviewDecision.lastUpdated')}
        {displayHeader('tableReviewDecision.feasible')}
        {displayHeader('tableReviewDecision.decisionScore')}
        {displayHeader('tableReviewDecision.rank')}
        {displayHeader('recommendations.label')}
        {displayHeader('tableReviewDecision.actions')}
      </TableRow>
    </TableHead>
  );
}
