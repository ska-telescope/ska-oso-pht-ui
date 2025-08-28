import React, { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

type ResizablePanelProps = {
  children: ReactNode;
  title: string;
};

const ResizablePanel: React.FC<ResizablePanelProps> = ({ children, title }) => (
  <Box
    data-testid="resizable-panel"
    sx={{
      width: '30vw',
      height: '30vh',
      position: 'relative',
      overflow: 'auto',
      resize: 'both',
      border: '1px solid #ccc',
      borderRadius: '16px'
    }}
  >
    <Typography p={1} variant="h5" data-testid="panel-title">
      {title}
    </Typography>

    <div className="flex-1 flex items-center justify-center w-full h-full">
      <div
        data-testid="panel-content"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%'
        }}
      >
        {children}
      </div>
    </div>
  </Box>
);

export default ResizablePanel;
