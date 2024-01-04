import React from 'react';
import { Grid, Divider } from '@mui/material';
import StatusWrapper from '../wrappers/statusWrapper/StatusWrapper';
import { PAGES } from '../../utils/constants';

interface StatusArrayProps {
  setPage: Function;
  proposalState: number[];
}

export default function StatusArray({ setPage, proposalState }: StatusArrayProps) {
  const generateDivider = (index: number) => {
    if (index < PAGES.length - 1) {
      return (
        <Grid item mt={-2} sx={{ width: '6%' }}>
          <Divider sx={{ width: '100%', borderBottomWidth: '3px' }} />
        </Grid>
      );
    }
    return null;
  };

  return (
    <Grid
      sx={{ bgcolor: 'transparent' }}
      container
      direction="row"
      alignItems="center"
      justifyContent="space-evenly"
    >
      {PAGES.map((_page, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <React.Fragment key={index}>
          <Grid item>
            <StatusWrapper level={proposalState[index]} page={index} setPage={setPage} />
          </Grid>
          {generateDivider(index)}
        </React.Fragment>
      ))}
    </Grid>
  );
}
