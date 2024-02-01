import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import { FileCopyRounded } from '@mui/icons-material';

interface CloneIconProps {
  disabled: boolean;
  onClick: Function;
  selected?: boolean;
  toolTip: string;
}

export default function CloneIcon({
  disabled = false,
  onClick,
  selected,
  toolTip = ''
}: CloneIconProps) {
  const theme = useTheme();

  return (
    <Tooltip title={toolTip} arrow>
      <IconButton
        aria-label="clone"
        disabled={disabled}
        onClick={() => onClick}
        style={{ cursor: 'hand' }}
      >
        {selected && <FileCopyRounded sx={{ color: theme.palette.secondary.contrastText }} />}
        {!selected && <FileCopyRounded />}
      </IconButton>
    </Tooltip>
  );
}
