import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { DeleteRounded } from '@mui/icons-material';

interface TrashIconProps {
  disabled?: boolean;
  onClick: Function;
  toolTip: string;
}

export default function TrashIcon({ disabled = false, onClick, toolTip = '' }: TrashIconProps) {
  return (
    <Tooltip title={toolTip} arrow>
      <span>
        <IconButton
          aria-label="delete"
          disabled={disabled}
          onClick={() => onClick()}
          style={{ cursor: 'pointer' }}
        >
          <DeleteRounded />
        </IconButton>
      </span>
    </Tooltip>
  );
}
