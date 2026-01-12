import React from 'react';
import { Grid, Divider, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { STATUS_ARRAY_PAGES_PROPOSAL, STATUS_ARRAY_PAGES_SV } from '@utils/constants.ts';
import StatusWrapper from '../wrappers/statusWrapper/StatusWrapper';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';

export default function StatusArray() {
  const { application } = storageObject.useStore();
  const { isSV } = useOSDAccessors();

  const theme = useTheme();
  const sizeOk = useMediaQuery(theme.breakpoints.up('md'));

  const pages = isSV ? STATUS_ARRAY_PAGES_SV : STATUS_ARRAY_PAGES_PROPOSAL;
  const levels = application.content1 as number[];

  return (
    <Grid
      sx={{ bgcolor: 'transparent' }}
      container
      direction="row"
      alignItems="center"
      justifyContent="space-evenly"
    >
      {pages.map((page, idx) => (
        <React.Fragment key={page}>
          <Grid>
            <StatusWrapper level={levels[page]} page={page} />
          </Grid>

          {sizeOk && idx < pages.length - 1 && (
            <Grid mt={-2} sx={{ width: '3%' }}>
              <Divider sx={{ width: '100%', borderBottomWidth: '3px' }} />
            </Grid>
          )}
        </React.Fragment>
      ))}
    </Grid>
  );
}
