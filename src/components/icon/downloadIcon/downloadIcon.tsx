import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import { DownloadRounded } from '@mui/icons-material';

interface DownloadIconProps {
  disabled: boolean;
  onClick: Function;
  selected?: boolean;
  toolTip: string;
}

export default function DownloadIcon({
  disabled = false,
  onClick,
  selected,
  toolTip = ''
}: DownloadIconProps) {
  const theme = useTheme();

  return (
    <Tooltip title={toolTip} arrow>
      <IconButton
        aria-label="clone"
        disabled={disabled}
        onClick={() => onClick}
        style={{ cursor: 'hand' }}
      >
        {selected && <DownloadRounded sx={{ color: theme.palette.secondary.contrastText }} />}
        {!selected && <DownloadRounded />}
      </IconButton>
    </Tooltip>
  );
}
