import { TableHead, TableRow, TableCell, Typography } from '@mui/material';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

export default function TableObservationsHeader() {
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
        {displayHeader('observationType.label')}
        {displayHeader('observationId.label')}
        {displayHeader('subArrayConfiguration.label')}
        {displayHeader('observingBand.label')}
        {displayHeader('')}
      </TableRow>
    </TableHead>
  );
}
