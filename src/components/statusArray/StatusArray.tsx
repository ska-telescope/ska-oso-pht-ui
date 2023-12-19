import React from 'react';
import { Grid } from '@mui/material';
import StatusWrapper from '../wrappers/statusWrapper/StatusWrapper';
import { PAGES } from '../../utils/constants';

interface StatusArrayProps {
  setPage: Function;
}

export default function StatusArray({ setPage }: StatusArrayProps) {
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
        <StatusWrapper level={PAGES[0].status} page={0} setPage={setPage} />
      </Grid>
      <Grid item>
        <StatusWrapper level={PAGES[1].status} page={1} setPage={setPage} />
      </Grid>
      <Grid item>
        <StatusWrapper level={PAGES[2].status} page={2} setPage={setPage} />
      </Grid>
      <Grid item>
        <StatusWrapper level={PAGES[3].status} page={3} setPage={setPage} />
      </Grid>
      <Grid item>
        <StatusWrapper level={PAGES[4].status} page={4} setPage={setPage} />
      </Grid>
      <Grid item>
        <StatusWrapper level={PAGES[5].status} page={5} setPage={setPage} />
      </Grid>
      <Grid item>
        <StatusWrapper level={PAGES[6].status} page={6} setPage={setPage} />
      </Grid>
      <Grid item>
        <StatusWrapper level={PAGES[7].status} page={7} setPage={setPage} />
      </Grid>
    </Grid>
  );
}
