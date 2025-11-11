import React from 'react';
import { Grid, Divider } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  PAGE_CALIBRATION,
  PAGE_DATA_PRODUCTS,
  PAGE_DESCRIPTION,
  PAGE_GENERAL,
  PAGE_OBSERVATION,
  PAGE_TARGET,
  PAGE_TEAM,
  PAGE_TITLE_ADD
} from '@utils/constants.ts';
import StatusWrapper from '../wrappers/statusWrapper/StatusWrapper';

export default function StatusArrayOriginal() {
  const { application } = storageObject.useStore();

  const SIZE_OK = () => useMediaQuery(useTheme().breakpoints.up('md'));

  const generateDivider = (index: number) => {
    if (SIZE_OK() && index < getPages().length) {
      return (
        <Grid mt={-2} sx={{ width: '3%' }}>
          <Divider sx={{ width: '100%', borderBottomWidth: '3px' }} />
        </Grid>
      );
    }
    return null;
  };

  const generateStatus = (index: number) => {
    const lvl = (application.content1 as number[])[index];
    return (
      <Grid>
        <StatusWrapper level={lvl} page={index} />
      </Grid>
    );
  };

  // TODO : This will need to be extended once we move out of MOCK_CALL mode
  const getPages = () => [
    PAGE_TITLE_ADD,
    PAGE_TEAM,
    PAGE_GENERAL,
    PAGE_DESCRIPTION,
    PAGE_TARGET,
    PAGE_OBSERVATION,
    PAGE_DATA_PRODUCTS,
    PAGE_CALIBRATION
  ];

  return (
    <Grid
      sx={{ bgcolor: 'transparent' }}
      container
      direction="row"
      alignItems="center"
      justifyContent="space-evenly"
    >
      {getPages().map(e => (
        <React.Fragment key={e}>
          {generateStatus(e)}
          {generateDivider(e)}
        </React.Fragment>
      ))}
    </Grid>
  );
}
