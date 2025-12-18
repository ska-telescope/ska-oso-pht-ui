import { TableHead, TableRow, TableCell, Typography } from '@mui/material';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

export default function TableSubmissionsHeader() {
  const { t } = useScopedTranslation();

  const displayHeader = (inValue: string) => (
    <TableCell sx={{ whiteSpace: 'nowrap', width: 0, paddingRight: 2 }}>
      <Typography variant="subtitle2" fontWeight="bold">
        {inValue ? t(inValue) : ''}
      </Typography>
    </TableCell>
  );

  return (
    <TableHead>
      <TableRow>
        {displayHeader('actions.label')}
        {displayHeader('proposalId.label')}
        {displayHeader('cycle.label')}
        {displayHeader('')}
        {displayHeader('title.label')}
        {displayHeader('proposalType.label')}
        {displayHeader('status.label')}
        {displayHeader('updated.label')}
        {displayHeader('cycleCloses.label')}
      </TableRow>
    </TableHead>
  );
}
