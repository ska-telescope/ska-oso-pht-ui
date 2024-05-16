import React from 'react';
import { IconButton, Tooltip } from '@mui/material';

interface IconProps {
  disabled?: boolean;
  onClick: Function;
  icon: JSX.Element;
  testId: string;
  toolTip: string;
}

export default function Icon({ disabled = false, icon, onClick, testId, toolTip = '' }: IconProps) {
  return (
    <Tooltip data-testid={testId} title={toolTip} arrow>
      <span>
        <IconButton
          aria-label={toolTip}
          disabled={disabled}
          onClick={() => onClick()}
          style={{ cursor: 'pointer' }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
}
