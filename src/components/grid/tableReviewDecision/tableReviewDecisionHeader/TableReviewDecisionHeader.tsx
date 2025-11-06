import { TableHead, TableRow, TableCell, Typography } from '@mui/material';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useAppFlow } from '@/utils/appFlow/AppFlowContext';

export default function TableReviewDecisionHeader() {
  const { t } = useScopedTranslation();
  const { isSV } = useAppFlow();

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
        {displayHeader('tableReviewDecision.actions')}
        {displayHeader('tableReviewDecision.sciReviews')}
        {displayHeader('scienceCategory.label')}
        {displayHeader('tableReviewDecision.title')}
        {displayHeader('tableReviewDecision.decisionStatus')}
        {displayHeader('tableReviewDecision.lastUpdated')}
        {!isSV() && displayHeader('tableReviewDecision.feasible')}
        {displayHeader('tableReviewDecision.decisionScore')}
        {displayHeader('tableReviewDecision.rank')}
        {displayHeader('recommendations.label')}
      </TableRow>
    </TableHead>
  );
}
