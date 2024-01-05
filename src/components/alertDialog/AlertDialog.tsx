import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Typography } from '@mui/material';
import { ButtonColorTypes, ButtonVariantTypes, Button } from '@ska-telescope/ska-gui-components';

export default function AlertDialog(props) {
  const { open, onClose, onDialogResponse } = props;

  const handleContinue = () => {
    onDialogResponse('continue');
    onClose();
  };

  const handleCancel = () => {
    onDialogResponse('cancel');
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
      <DialogTitle id="alert-dialog-title">Change Proposal&apos;s type?</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description" component="div">
          <Typography variant="body1">
            You are about to change the type of your proposal.
          </Typography>
          <Typography variant="body1">
            Some data specific to the proposal type may be lost.
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: '24px' }}>
        <Button
          ariaDescription="Cancel Button"
          color={ButtonColorTypes.Secondary}
          label="Cancel"
          onClick={handleCancel}
          testId="cancelId"
          variant={ButtonVariantTypes.Contained}
        />
        <Button
          ariaDescription="Continue Button"
          color={ButtonColorTypes.Secondary}
          label="Continue"
          onClick={handleContinue}
          testId="continueId"
          variant={ButtonVariantTypes.Contained}
        />
      </DialogActions>
    </Dialog>
  );
}
