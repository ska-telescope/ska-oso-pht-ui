import React from 'react';
import { Grid, Divider } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import StatusWrapper from '../wrappers/statusWrapper/StatusWrapper';
import { PAGES } from '../../utils/constants';

interface StatusArrayProps {
  setPage: Function;
}

export default function StatusArray({ setPage }: StatusArrayProps) {
  const { application } = storageObject.useStore();

  const getProposalState = () => application.content1 as number[];

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
            <StatusWrapper level={getProposalState()[index]} page={index} setPage={setPage} />
          </Grid>
          {generateDivider(index)}
        </React.Fragment>
      ))}
    </Grid>
  );
}
