import { Grid, Paper } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import Notification from '../../../utils/types/notification';
import TimedAlert from '../../alerts/timedAlert/TimedAlert';
import { FOOTER_PMT } from '@/utils/constants';

export default function PageFooterPMT() {
  const { application } = storageObject.useStore();

  const showNotification = () => {
    const note = application.content5 as Notification;
    return note?.message?.length > 0 && note?.level === AlertColorTypes.Error;
  };

  return (
    <Paper
      sx={{
        width: '100vw',
        borderRadius: 0,
        position: 'fixed',
        bottom: FOOTER_PMT,
        left: 0,
        right: 0
      }}
      elevation={0}
    >
      <Grid pt={4} container direction="row" alignItems="center" justifyContent="space-around">
        <Grid>
          <Grid>
            {showNotification() && (
              <TimedAlert
                color={(application.content5 as Notification)?.level}
                delay={(application.content5 as Notification)?.delay}
                testId="timeAlertFooter"
                text={(application.content5 as Notification)?.message}
              />
            )}
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
}
