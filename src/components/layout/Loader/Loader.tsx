import * as React from 'react';
import { Box } from '@mui/material';
import { Backdrop, Progress } from '@ska-telescope/ska-gui-components';

export default function Loader() {
  return (
    <Box>
      <Backdrop open>
        <Progress size={100} testId="progressTestId" />
      </Backdrop>
    </Box>
  );
}
