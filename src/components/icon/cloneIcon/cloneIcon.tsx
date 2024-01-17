import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { FileCopyRounded } from '@mui/icons-material';

interface CloneIconProps {
  toolTip: string;
  onClick: Function;
}

export default function CloneIcon({ toolTip = '', onClick }: CloneIconProps) {
  return (
    <Tooltip title={toolTip} arrow>
      <IconButton aria-label="clone" onClick={() => onClick} style={{ cursor: 'hand' }}>
        <FileCopyRounded />
      </IconButton>
    </Tooltip>
  );
}
