import React from 'react';
import { Grid, Divider } from '@mui/material';
import StatusWrapper from '../wrappers/statusWrapper/StatusWrapper';
import { PAGES } from '../../utils/constants';

interface StatusArrayProps {
  setPage: Function;
}

export default function StatusArray({ setPage }: StatusArrayProps) {
  const generateDivider = (index: number) => {
    if (index < PAGES.length - 1) {
      return (
        <React.Fragment>
          <Grid item sx={{ width: '50px' }}>
            <Divider sx={{ width: 'calc(100% + 16px)', marginLeft: '-8px' ,  borderBottom: '2px solid grey'}} />
          </Grid>
        </React.Fragment>
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
      {PAGES.map((page, index) => (
        <React.Fragment key={index}>
          <Grid item>
            <StatusWrapper level={page.status} page={index} setPage={setPage} />
          </Grid>
          {generateDivider(index)}
        </React.Fragment>
      ))}
    </Grid>
  );
}
