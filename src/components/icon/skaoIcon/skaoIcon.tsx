import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Logo } from '@ska-telescope/ska-javascript-components';

interface IconProps {
  disabled?: boolean;
  logoHeight?: number;
  isDarkTheme?: boolean;
  onClick?: Function;
  testId?: string;
  toolTip?: string;
}

export default function skaoIcon({
  disabled = false,
  logoHeight = 60,
  isDarkTheme = false,
  onClick = null,
  testId = '',
  toolTip = ''
}: IconProps) {
  return (
    <Tooltip data-testid={testId} title={toolTip} arrow>
      <span>
        <IconButton
          aria-label={toolTip}
          disabled={disabled}
          onClick={() => onClick()}
          style={{ cursor: 'pointer' }}
        >
          <Logo dark={isDarkTheme} height={logoHeight} />
        </IconButton>
      </span>
    </Tooltip>
  );
}
