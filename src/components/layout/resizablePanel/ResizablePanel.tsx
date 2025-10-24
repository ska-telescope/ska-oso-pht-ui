import React, { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

type ResizablePanelProps = {
  children: ReactNode;
  height?: string;
  title: string;
  width?: string;
};

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  height = '40vh',
  title,
  width = '31vw'
}) => (
  <Box
    data-testid="resizable-panel"
    sx={{
      width,
      height,
      position: 'relative',
      overflow: 'auto',
      resize: 'both',
      border: '1px solid #ccc',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    <Typography p={1} variant="h5" data-testid="panel-title">
      {title}
    </Typography>

    <Box
      data-testid="panel-content"
      sx={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
      }}
    >
      {children}
    </Box>
  </Box>
);

export default ResizablePanel;
