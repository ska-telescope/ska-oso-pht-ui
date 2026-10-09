import { Grid } from '@mui/material';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import Alert from '../../../../components/alerts/standardAlert/StandardAlert';

export default function SpatialImaging() {
  return (
    <Grid
      spacing={1}
      container
      direction="row"
      sx={{
        p: 1,
        alignItems: 'flex-start',
        justifyContent: 'space-around',
        width: '100%'
      }}
    >
      <Grid
        sx={{
          p: 10
        }}
      >
        <Alert
          color={AlertColorTypes.Info}
          text="This functionality is not currently available"
          testId="helpPanelId"
        />
      </Grid>
    </Grid>
  );
}
