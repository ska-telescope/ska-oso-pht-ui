import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { DownloadRounded } from '@mui/icons-material';

interface DownloadIconProps {
  toolTip: string;
  onClick: Function;
}

export default function DownloadIcon({ toolTip = '', onClick }: DownloadIconProps) {
  return (
    <Tooltip title={toolTip} arrow>
      <IconButton aria-label={toolTip} onClick={() => onClick} style={{ cursor: 'hand' }}>
        <DownloadRounded />
      </IconButton>
    </Tooltip>
  );
}
