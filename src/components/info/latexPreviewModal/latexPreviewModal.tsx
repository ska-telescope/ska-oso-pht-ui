import React from 'react';
import { Dialog, DialogContent, Grid, DialogTitle } from '@mui/material';
import { presentLatex } from '../../../utils/present';

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
        >
          {presentLatex(value)}
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
