import React from 'react';
import { Grid, Typography } from '@mui/material';
import { TextEntry } from '@ska-telescope/ska-gui-components';

export default function DataContent() {
  const [theTitle, setTheTitle] = React.useState('');

  return (
    <Grid container direction="column" alignItems="space-evenly" justifyContent="space-around">
      <Grid item>
        <Typography variant="h6" m={2}>
          SDP
        </Typography>
      </Grid>
      <Grid item>
        <TextEntry label="Pipeline" testId="titleId" value={theTitle} setValue={setTheTitle} />
      </Grid>
      <Grid item>
        <Typography variant="h6" m={2}>
          SRC Net
        </Typography>
      </Grid>
    </Grid>
  );
}
