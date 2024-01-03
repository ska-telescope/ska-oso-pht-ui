import React from 'react';
import { Grid } from '@mui/material';
import StatusWrapper from '../wrappers/statusWrapper/StatusWrapper';

interface StatusArrayProps {
  setPage: Function;
  proposalState: number[];
}

export default function StatusArray({ setPage, proposalState }: StatusArrayProps) {
  return (
    <Grid
      sx={{ bgcolor: 'transparent' }}
      container
      direction="row"
      alignItems="center"
      justifyContent="space-evenly"
    >
      <Grid item />
      <Grid item>
        <StatusWrapper level={proposalState[0]} page={0} setPage={setPage} />
      </Grid>
      <Grid item>
        <StatusWrapper level={proposalState[1]} page={1} setPage={setPage} />
      </Grid>
      <Grid item>
        <StatusWrapper level={proposalState[2]} page={2} setPage={setPage} />
      </Grid>
      <Grid item>
        <StatusWrapper level={proposalState[3]} page={3} setPage={setPage} />
      </Grid>
      <Grid item>
        <StatusWrapper level={proposalState[4]} page={4} setPage={setPage} />
      </Grid>
      <Grid item>
        <StatusWrapper level={proposalState[5]} page={5} setPage={setPage} />
      </Grid>
      <Grid item>
        <StatusWrapper level={proposalState[6]} page={6} setPage={setPage} />
      </Grid>
      <Grid item>
        <StatusWrapper level={proposalState[7]} page={7} setPage={setPage} />
      </Grid>
    </Grid>
  );
}
