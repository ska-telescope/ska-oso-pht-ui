import { Dialog, DialogContent, Grid2, DialogTitle } from '@mui/material';
import { presentLatex } from '@utils/present/present';
import CancelButton from '../../button/Cancel/Cancel';
interface LatexPreviewProps {
  value: string;
  open: boolean;
  onClose: Function;
  title: string;
}

const MODAL_WIDTH = '50%';

export default function LatexPreviewModal({ value, open, onClose, title }: LatexPreviewProps) {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="latex-preview-title"
      aria-describedby="latex-preview-description"
      id="latex-preview-id"
      PaperProps={{
        style: {
          minWidth: MODAL_WIDTH,
          maxWidth: MODAL_WIDTH
        }
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Grid2
          p={2}
          container
          direction="column"
          alignItems="space-evenly"
          justifyContent="space-around"
          spacing={1}
        >
          <Grid2 size={{ xs: 12 }}>{presentLatex(value)}</Grid2>
          <Grid2>
            <Grid2 container direction="row" justifyContent="right" alignItems="right">
              <Grid2 pt={1}>
                <CancelButton
                  action={handleClose}
                  title="button.close"
                  testId="cancelButtonTestId"
                />
              </Grid2>
            </Grid2>
          </Grid2>
        </Grid2>
      </DialogContent>
    </Dialog>
  );
}
