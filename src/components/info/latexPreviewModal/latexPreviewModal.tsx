import React from 'react';
import { Dialog, DialogContent, Grid, DialogTitle, DialogActions } from '@mui/material';
import { presentLatex } from '../../../utils/present';
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

  const pageFooter = () => (
    <Grid container direction="row" justifyContent="space-between" alignItems="center">
      <Grid item>
        <CancelButton action={handleClose} title="button.close" testId="cancelButtonTestId" />
      </Grid>
    </Grid>
  );

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
        >
          {presentLatex(value)}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ padding: 5 }}>{pageFooter()}</DialogActions>
    </Dialog>
  );
}
