import React from 'react';
import { Dialog, DialogActions, DialogContent, Grid, Typography } from '@mui/material';
import CancelButton from '../../button/cancel/CancelButton';
import { Calculate } from '@mui/icons-material';

interface ObservationTargetResultsDisplayProps {
  open: boolean;
  onClose: Function;
  data: any;
}

export default function ObservationTargetResultsDisplay({
  open,
  onClose,
  data
}: ObservationTargetResultsDisplayProps) {
  const handleClose = () => {
    onClose();
  };

  const pageFooter = () => (
    <Grid container direction="row" justifyContent="space-between" alignItems="center">
      <Grid item>
        <CancelButton onClick={handleClose} label="button.close" />
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
    >
      <DialogContent>
        <Grid
          p={2}
          container
          direction="column"
          alignItems="space-evenly"
          justifyContent="space-around"
        >
          <Typography>
            Calculate Result Sensitivity: {data?.calculate?.data?.result?.sensitivity}
          </Typography>
        </Grid>
      </DialogContent>
      <DialogActions>{pageFooter()}</DialogActions>
    </Dialog>
  );
}
