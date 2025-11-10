import { TableHead, TableRow, TableCell, Typography } from '@mui/material';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

export default function TableDataProductsHeader() {
  const { t } = useScopedTranslation();

  const displayHeader = (inValue: string) => (
    <TableCell sx={{ whiteSpace: 'nowrap', width: '1%', paddingRight: 2 }}>
      <Typography variant="subtitle2" fontWeight="bold">
        {inValue ? t(inValue) : ''}
      </Typography>
    </TableCell>
  );

  return (
    <TableHead>
      <TableRow>
        {displayHeader('actions.label')}
        {displayHeader('observations.dp.label')}
        {displayHeader('observatoryDataProduct.label')}
        {displayHeader('imageSize.label')}
        {displayHeader('pixelSize.label')}
        {displayHeader('imageWeighting.label')}
      </TableRow>
    </TableHead>
  );
}
