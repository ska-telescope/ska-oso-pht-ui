import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Download } from '@mui/icons-material';

interface DownloadIconProps {
  toolTip: string;
  onClick: Function;
}

export default function DownloadIcon({ toolTip = '', onClick }: DownloadIconProps) {
  return (
    <Tooltip test-Id="downloadIcon" title={toolTip} arrow>
      <IconButton aria-label="download" onClick={() => onClick()} style={{ cursor: 'pointer' }}>
        <Download />
      </IconButton>
    </Tooltip>
  );
}
