import React from 'react';
import { Grid, Divider } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { STATUS_ARRAY_PAGES } from '@utils/constants.ts';
import StatusWrapper from '../wrappers/statusWrapper/StatusWrapper';

interface StatusArrayOriginalProps {
  updateCanSubmit: Function;
  accessCanSubmit: Boolean;
}

export default function StatusArrayOriginal({
  updateCanSubmit,
  accessCanSubmit
}: StatusArrayOriginalProps) {
  const { application } = storageObject.useStore();

  const SIZE_OK = () => useMediaQuery(useTheme().breakpoints.up('md'));

  const generateDivider = (index: number) => {
    if (SIZE_OK() && index < STATUS_ARRAY_PAGES.length) {
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

  React.useEffect(() => {
    const pagesIndexes = STATUS_ARRAY_PAGES;
    const pagesNeedToCheck = (application.content1 as number[]).filter((value, idx) =>
      pagesIndexes.includes(idx)
    );

    if (pagesNeedToCheck.every(lvl => lvl === 0) && accessCanSubmit) {
      updateCanSubmit(true);
    } else {
      updateCanSubmit(false);
    }
  }, [application.content1]);

  return (
    <Grid
      sx={{ bgcolor: 'transparent' }}
      container
      direction="row"
      alignItems="center"
      justifyContent="space-evenly"
    >
      {STATUS_ARRAY_PAGES.map(e => (
        <React.Fragment key={e}>
          {generateStatus(e)}
          {generateDivider(e)}
        </React.Fragment>
      ))}
    </Grid>
  );
}
