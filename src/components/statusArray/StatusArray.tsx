import React from 'react';
import { Grid, Divider, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { storageObject } from '@utils/storage/store';
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
      container
      direction="row"
      sx={{
        alignItems: 'center',
        justifyContent: 'space-evenly',
        bgcolor: 'transparent'
      }}
    >
      {pages.map((page, idx) => (
        <React.Fragment key={page}>
          <Grid>
            <StatusWrapper level={levels[page]} page={page} />
          </Grid>

          {sizeOk && idx < pages.length - 1 && (
            <Grid
              sx={{
                mt: -2,
                width: '3%'
              }}
            >
              <Divider sx={{ width: '100%', borderBottomWidth: '3px' }} />
            </Grid>
          )}
        </React.Fragment>
      ))}
    </Grid>
  );
}
