import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { EditRounded } from '@mui/icons-material';

interface EditIconProps {
  toolTip: string;
  onClick: Function;
}

export default function EditIcon({ toolTip = '', onClick }: EditIconProps) {
  return (
    <Tooltip title={toolTip} arrow>
      <IconButton aria-label="view" onClick={() => onClick()} style={{ cursor: 'pointer' }}>
        <EditRounded />
      </IconButton>
    </Tooltip>
  );
}
