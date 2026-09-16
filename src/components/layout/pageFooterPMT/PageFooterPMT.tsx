import { Paper } from '@mui/material';
import { FOOTER_PMT } from '@/utils/constants';

export default function PageFooterPMT() {
  return (
    <Paper
      sx={{
        width: '100vw',
        borderRadius: 0,
        position: 'fixed',
        bottom: FOOTER_PMT,
        left: 0,
        right: 0,
        pointerEvents: 'none'
      }}
      elevation={0}
    />
  );
}
