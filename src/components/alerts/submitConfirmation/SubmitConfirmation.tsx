import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Grid, Typography } from '@mui/material';
import CancelButton from '../../button/cancel/CancelButton';
import ConfirmButton from '../../button/confirm/ConfirmButton';

interface SubmitConfirmationProps {
  open: boolean;
  onClose: Function;
  onConfirm: Function;
}

export default function SubmitConfirmation({ open, onClose, onConfirm }: SubmitConfirmationProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      id="alert-dialog-proposal-change"
    >
      <DialogTitle id="alert-dialog-title">SUBMIT PROPOSAL</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description" component="div">
          <Typography variant="body1">NEED TO PUT THE PROPOSAL SUMMARY DATA IN HERE</Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: '24px' }}>
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
          <Grid item>
            <CancelButton onClick={handleCancel} />
          </Grid>
          <Grid item>
            <ConfirmButton onClick={handleConfirm} />
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
}
