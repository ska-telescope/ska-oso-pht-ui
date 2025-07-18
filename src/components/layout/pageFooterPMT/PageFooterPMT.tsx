import { Grid2, Paper } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import Notification from '../../../utils/types/notification';
import TimedAlert from '../../alerts/timedAlert/TimedAlert';

export default function PageFooterPMT() {
  const { application } = storageObject.useStore();

  return (
    <Paper sx={{ width: '100vw', position: 'fixed', bottom: 40, left: 0, right: 0 }} elevation={0}>
      <Grid2 p={4} container direction="row" alignItems="center" justifyContent="space-around">
        <Grid2>
          {(application.content5 as Notification)?.message?.length > 0 && (
            <TimedAlert
              color={(application.content5 as Notification)?.level}
              delay={(application.content5 as Notification)?.delay}
              testId="timeAlertFooter"
              text={(application.content5 as Notification)?.message}
            />
          )}
        </Grid2>
      </Grid2>
    </Paper>
  );
}
