import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from '@mui/material';
import CancelButton from '../../button/CancelButton/Cancel';
import ConfirmButton from '../../button/ConfirmButton/Confirm';

interface AlertDialogProps {
  open: boolean;
  onClose: Function;
  onDialogResponse: Function;
  title?: string;
  children?: JSX.Element | JSX.Element[];
}

export default function AlertDialog({
  open,
  onClose,
  onDialogResponse,
  title = '',
  children
}: AlertDialogProps) {
  const { t } = useTranslation('pht');

  const handleContinue = () => {
    onDialogResponse();
  };

  const handleCancel = () => {
    onClose();
  };

  const alertTitle = () => (
    <Grid container direction="row" justifyContent="space-around" alignItems="center">
      <Grid item>
        <Typography variant="h5">{t(title)}</Typography>
      </Grid>
    </Grid>
  );

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={handleCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      id="alert-dialog-proposal-change"
    >
      <DialogTitle>{alertTitle()}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
          <Grid item>
            <CancelButton action={handleCancel} />
          </Grid>
          <Grid item>
            <ConfirmButton action={handleContinue} />
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
}
