import React from 'react';
import { Grid, Typography } from '@mui/material';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import { STATUS_ERROR, STATUS_PARTIAL, STATUS_OK } from '../../../utils/constants';

interface DataContentProps {
  page: number;
  setStatus: Function;
}

export default function DataContent({ page, setStatus }: DataContentProps) {
  const [theTitle, setTheTitle] = React.useState('');

  React.useEffect(() => {
    if (typeof setStatus !== 'function') {
      return;
    }
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
    const count = 0;

    // TODO : Increment the count for every passing element of the page.
    // This is then used to take the status from the result array
    // In the default provided, the count must be 2 for the page to pass.

    // See titleContent page for working example

    setStatus([page, result[count]]);
  }, [setStatus]);

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
