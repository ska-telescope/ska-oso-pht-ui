import React from 'react';
import { Grid, Divider } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/material/styles/useTheme';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import StatusWrapper from '../wrappers/statusWrapper/StatusWrapper';
import { NAV } from '../../utils/constants';

export default function StatusArrayOriginal() {
  const { application } = storageObject.useStore();

  const SIZE_OK = () => useMediaQuery(useTheme().breakpoints.up('md'));

  const generateDivider = (index: number) => {
    if (SIZE_OK() && index < NAV.length - 1) {
      return (
        <Grid item mt={-2} sx={{ width: '3%' }}>
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
      {NAV.map((_page, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <React.Fragment key={index}>
          <Grid item>
            <StatusWrapper level={application.content1[index]} page={index} />
          </Grid>
          {generateDivider(index)}
        </React.Fragment>
      ))}
    </Grid>
  );
}
