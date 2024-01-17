import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { DeleteRounded } from '@mui/icons-material';

interface TrashIconProps {
  toolTip: string;
  onClick: Function;
}

export default function TrashIcon({ toolTip = '', onClick }: TrashIconProps) {
  return (
    <Tooltip title={toolTip} arrow>
      <IconButton aria-label={toolTip} onClick={() => onClick} style={{ cursor: 'hand' }}>
        <DeleteRounded />
      </IconButton>
    </Tooltip>
  );
}
