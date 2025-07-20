import { useTranslation } from 'react-i18next';
import {
  Breakpoint,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2,
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
    <Grid2 container direction="row" justifyContent="space-around" alignItems="center">
      <Grid2>
        <Typography variant="h5">{t(title)}</Typography>
      </Grid2>
    </Grid2>
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
        <Grid2
          spacing={1}
          container
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid2>
            <CancelButton testId="dialogCancelButton" action={handleCancel} />
          </Grid2>
          <Grid2>
            <ConfirmButton testId="dialogConfirmationButton" action={handleContinue} />
          </Grid2>
        </Grid2>
      </DialogActions>
    </Dialog>
  );
}
