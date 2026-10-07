import React from 'react';
import { Box } from '@mui/material';

interface FieldWrapperProps {
  children?: React.ReactNode;
}

const WRAPPER_HEIGHT = '75px';

export default function FieldWrapper({ children }: FieldWrapperProps): React.JSX.Element {
  return (
    <Box
      data-testid="fieldWrapperTestId"
      sx={{
        p: 0,
        pt: 1,
        height: WRAPPER_HEIGHT
      }}
    >
      {children}
    </Box>
  );
}
