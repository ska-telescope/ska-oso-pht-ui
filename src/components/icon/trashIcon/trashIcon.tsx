import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import { DeleteRounded } from '@mui/icons-material';

interface TrashIconProps {
  disabled: boolean;
  onClick: Function;
  selected?: boolean;
  toolTip: string;
}

export default function TrashIcon({ disabled = false, onClick, selected, toolTip = '' }: TrashIconProps) {
  const theme = useTheme();

  return (
    <Tooltip title={toolTip} arrow>
      <IconButton aria-label={toolTip} disabled={disabled} onClick={() => onClick} style={{ cursor: 'hand' }}>
        {selected && <DeleteRounded sx={{ color: theme.palette.secondary.contrastText }} />}
        {!selected && <DeleteRounded />}
      </IconButton>
    </Tooltip>
  );
}
