import { Dialog, Grid } from '@mui/material';
import PDFViewer from '../PDFViewer/PDFViewer';
import CancelButton from '@/components/button/Cancel/Cancel';

interface PDFWrapperProps {
  open: boolean;
  onClose: Function;
  url: string;
}

export default function PDFWrapper({ open, onClose, url }: PDFWrapperProps) {
  const handleClose = () => {
    onClose();
  };

  const footerContent = () => (
    <Grid>
      <Grid container direction="row" justifyContent="right" alignItems="right">
        <Grid p={2}>
          <CancelButton action={handleClose} title="closeBtn.label" testId="cancelButtonTestId" />
        </Grid>
      </Grid>
    </Grid>
  );

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      id="alert-dialog-proposal-change"
      data-testid="pdf-wrapper"
    >
      <PDFViewer url={url} />
      {footerContent()}
    </Dialog>
  );
}
