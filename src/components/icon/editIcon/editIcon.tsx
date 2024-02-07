import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { EditRounded } from '@mui/icons-material';

interface EditIconProps {
  disabled?: boolean;
  onClick: Function;
  toolTip: string;
}

export default function EditIcon({ disabled = false, onClick, toolTip = '' }: EditIconProps) {
  return (
    <Tooltip title={toolTip} arrow>
      <span>
        <IconButton
          aria-label="view"
          disabled={disabled}
          onClick={() => onClick()}
          style={{ cursor: 'pointer' }}
        >
          <EditRounded />
        </IconButton>
      </span>
    </Tooltip>
  );
}
