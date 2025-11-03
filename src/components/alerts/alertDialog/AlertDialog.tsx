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
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface AlertDialogProps {
  maxWidth?: Breakpoint;
  open: boolean;
  onClose: Function;
  onDialogResponse: Function;
  title?: string;
  children?: JSX.Element | JSX.Element[];
  disabled: boolean;
}

export default function AlertDialog({
  maxWidth = 'sm',
  open,
  onClose,
  onDialogResponse,
  title = '',
  children,
  disabled
}: AlertDialogProps) {
  const { t } = useScopedTranslation();

  const handleContinue = () => {
    onDialogResponse();
  };

  const handleCancel = () => {
    onClose();
  };

  const alertTitle = () => (
    <Grid container direction="row" justifyContent="space-around" alignItems="center">
      <Grid>
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
        <Grid
          spacing={1}
          container
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid>
            <CancelButton testId="dialogCancelButton" action={handleCancel} />
          </Grid>
          <Grid>
            <ConfirmButton
              testId="dialogConfirmationButton"
              action={handleContinue}
              disabled={disabled}
            />
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
}
