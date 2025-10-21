import { Grid } from '@mui/material';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import Alert from '../../../../components/alerts/standardAlert/StandardAlert';

export default function SpatialImaging() {
  return (
    <Grid
      p={1}
      spacing={1}
      container
      direction="row"
      alignItems="flex-start"
      justifyContent="space-around"
      sx={{ width: '100%' }}
    >
      <Grid p={10}>
        <Alert
          color={AlertColorTypes.Info}
          text="This functionality is not currently available"
          testId="helpPanelId"
        />
      </Grid>
    </Grid>
  );
}
