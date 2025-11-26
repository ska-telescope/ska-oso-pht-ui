import React, { ReactNode } from 'react';
import { Box, Typography, useTheme } from '@mui/material';

type ResizablePanelProps = {
  children: ReactNode;
  height?: string;
  title: string;
  width?: string;
  errorColor?: boolean;
};

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  height = '40vh',
  title,
  width = '31vw',
  errorColor = false
}) => {
  const theme = useTheme();
  const resolvedColor = errorColor ? theme.palette.error.main : theme.palette.primary.dark;

  return (
    <Box
      data-testid="resizable-panel"
      sx={{
        width,
        height,
        position: 'relative',
        overflow: 'auto',
        resize: 'both',
        border: `2px solid ${resolvedColor}`,
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
};

export default ResizablePanel;
