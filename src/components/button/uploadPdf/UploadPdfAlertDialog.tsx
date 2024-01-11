import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Grid, Typography } from '@mui/material';
import { ButtonColorTypes, ButtonVariantTypes, Button } from '@ska-telescope/ska-gui-components';
export default function UploadPdfAlertDialog(props) {
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
      id="alert-dialog-pdf-upload"
    >
      <DialogTitle id="alert-dialog-title">Upload supporting PDF file?</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description" component="div">
          <Typography variant="body1">
            You are about to upload a PDF document to your proposal.
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: '24px' }}>
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
          <Grid item>
            <Button
              ariaDescription="Cancel Button"
              color={ButtonColorTypes.Secondary}
              label="Cancel"
              onClick={handleCancel}
              testId="cancelId"
              variant={ButtonVariantTypes.Contained}
            />
          </Grid>
          <Grid item>
            <Button
              ariaDescription="Continue Button"
              color={ButtonColorTypes.Secondary}
              label="Continue"
              onClick={handleContinue}
              testId="continueId"
              variant={ButtonVariantTypes.Contained}
            />
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
}
