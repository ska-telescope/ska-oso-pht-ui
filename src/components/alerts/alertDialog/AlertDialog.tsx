import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Breakpoint,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography
} from '@mui/material';
import CancelButton from '../../button/Cancel/Cancel';
import ConfirmButton from '../../button/Confirm/Confirm';

interface AlertDialogProps {
  maxWidth?: Breakpoint;
  open: boolean;
  onClose: Function;
  onDialogResponse: Function;
  title?: string;
  children?: JSX.Element | JSX.Element[];
}

export default function AlertDialog({
  maxWidth = 'sm',
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
      maxWidth={maxWidth}
      open={open}
      onClose={handleCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      id="alert-dialog-proposal-change"
    >
      <DialogTitle>{alertTitle()}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions sx={{ padding: 5 }}>
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
          <Grid item>
            <CancelButton action={handleCancel} testId="cancelButtonTestId" />
          </Grid>
          <Grid item>
            <ConfirmButton action={handleContinue} testId="confirmButtonTestId" />
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
}
