import { TableHead, TableRow, TableCell, Typography } from '@mui/material';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

export default function TableObservationHeader() {
  const { t } = useScopedTranslation();

  return (
    <TableHead>
      <TableRow>
        <TableCell sx={{ whiteSpace: 'nowrap', width: '1%', paddingRight: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {t('tableReviewDecision.actions')}
          </Typography>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', width: '1%', paddingRight: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" className="sr-only">
            telescope
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="subtitle2" fontWeight="bold">
            name (id?)
          </Typography>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', width: '1%', paddingRight: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            group
          </Typography>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', width: '1%', paddingRight: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            subarray (e.g. LOW AA2)
          </Typography>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', width: '1%', paddingRight: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            band (e.g. Band2)
          </Typography>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', width: '1%', paddingRight: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {t('tableReviewDecision.sciReviews')}
          </Typography>
        </TableCell>
      </TableRow>
    </TableHead>
  );
}
