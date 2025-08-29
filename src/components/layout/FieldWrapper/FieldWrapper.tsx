import React from 'react';
import { Box } from '@mui/material';

interface FieldWrapperProps {
  children?: React.ReactNode;
}

const WRAPPER_HEIGHT = '75px';

export default function FieldWrapper({ children }: FieldWrapperProps): JSX.Element {
  return (
    <Box data-testId="fieldWrapperTestId" p={0} pt={1} sx={{ height: WRAPPER_HEIGHT }}>
      {children}
    </Box>
  );
}
