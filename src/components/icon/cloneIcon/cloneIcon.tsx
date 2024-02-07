import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { FileCopyRounded } from '@mui/icons-material';

interface CloneIconProps {
  disabled?: boolean;
  onClick: Function;
  toolTip: string;
}

export default function CloneIcon({ disabled = false, onClick, toolTip = '' }: CloneIconProps) {
  return (
    <Tooltip title={toolTip} arrow>
      <IconButton
        aria-label="clone"
        disabled={disabled}
        onClick={() => onClick()}
        style={{ cursor: 'pointer' }}
      >
        <FileCopyRounded />
      </IconButton>
    </Tooltip>
  );
}
