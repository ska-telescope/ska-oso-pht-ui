import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { VisibilityRounded } from '@mui/icons-material';

interface ViewIconProps {
  toolTip: string;
  onClick: Function;
}

export default function ViewIcon({ toolTip = '', onClick }: ViewIconProps) {
  return (
    <Tooltip title={toolTip} arrow>
      <IconButton aria-label="view" onClick={() => onClick()} style={{ cursor: 'pointer' }}>
        <VisibilityRounded />
      </IconButton>
    </Tooltip>
  );
}
