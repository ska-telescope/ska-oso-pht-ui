import { Dialog, DialogContent, Grid, DialogTitle } from '@mui/material';
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
        <Grid
          p={2}
          container
          direction="column"
          alignItems="space-evenly"
          justifyContent="space-around"
          spacing={1}
        >
          <Grid size={{ xs: 12 }}>{presentLatex(value)}</Grid>
          <Grid>
            <Grid container direction="row" justifyContent="right" alignItems="right">
              <Grid pt={1}>
                <CancelButton
                  action={handleClose}
                  title="closeBtn.label"
                  testId="cancelButtonTestId"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
