import React from 'react';
import { Grid, Divider } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { NAV, PAGE_TECHNICAL } from '@utils/constants.ts';
import StatusWrapper from '../wrappers/statusWrapper/StatusWrapper';
import { useAppFlow } from '@/utils/appFlow/AppFlowContext';

export default function StatusArrayOriginal() {
  const { application } = storageObject.useStore();
  const { isSV } = useAppFlow();

  const SIZE_OK = () => useMediaQuery(useTheme().breakpoints.up('md'));

  const generateDivider = (index: number) => {
    if (SIZE_OK() && index < getNAVItems().length - 1) {
      return (
        <Grid mt={-2} sx={{ width: '3%' }}>
          <Divider sx={{ width: '100%', borderBottomWidth: '3px' }} />
        </Grid>
      );
    }
    return null;
  };

  const generateStatus = (index: number) => {
    const idx = index > PAGE_TECHNICAL - 1 ? index + 1 : index;
    const lvl = (application.content1 as number[])[idx];
    return (
      <Grid>
        <StatusWrapper level={lvl} page={idx} />
      </Grid>
    );
  };

  const getNAVItems = () => {
    return isSV() ? NAV.filter(rec => rec !== '/proposal/technical') : NAV;
  };

  return (
    <Grid
      sx={{ bgcolor: 'transparent' }}
      container
      direction="row"
      alignItems="center"
      justifyContent="space-evenly"
    >
      {getNAVItems().map((_page, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <React.Fragment key={index}>
          {generateStatus(index)}
          {generateDivider(index)}
        </React.Fragment>
      ))}
    </Grid>
  );
}
