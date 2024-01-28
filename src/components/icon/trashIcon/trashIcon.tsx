import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import { DeleteRounded } from '@mui/icons-material';

interface TrashIconProps {
  toolTip: string;
  onClick: Function;
  selected?: Boolean;
}

export default function TrashIcon({ toolTip = '', onClick, selected }: TrashIconProps) {
  const theme = useTheme();

  return (
    <Tooltip title={toolTip} arrow>
      <IconButton aria-label={toolTip} onClick={() => onClick} style={{ cursor: 'hand' }}>
        {selected && <DeleteRounded sx={{ color: theme.palette.secondary.contrastText }} />}
        {!selected && <DeleteRounded />}
      </IconButton>
    </Tooltip>
  );
}
