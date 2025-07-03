import { Dialog } from '@mui/material';
import PDFViewer from '../PDFViewer/PDFViewer';

interface PDFWrapperProps {
  open?: boolean;
  onClose: Function;
  url: string;
}

export default function PDFWrapper({ open = false, onClose, url }: PDFWrapperProps) {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      id="alert-dialog-proposal-change"
    >
      <PDFViewer url={url} />
    </Dialog>
  );
}
