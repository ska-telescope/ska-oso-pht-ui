import React from 'react';
import { IconButton } from '@mui/material';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { STATUS_ERROR, STATUS_ERROR_SYMBOL } from '../../../utils/constants';

interface StatusIconDisplayProps {
  ariaDescription: string;
  ariaTitle: string;
  level: number;
  onClick?: Function;
  size?: number;
  testId: string;
}

export default function StatusIconDisplay({
  ariaDescription,
  ariaTitle,
  level,
  onClick = null,
  size = 25,
  testId
}: StatusIconDisplayProps) {
  const action = () => {
    if (onClick !== null) {
      onClick();
    }
  };

  return (
    <IconButton aria-label="SensCalc Status" style={{ cursor: 'hand' }} onClick={() => action()}>
      <StatusIcon
        ariaDescription={ariaDescription}
        ariaTitle={ariaTitle}
        testId={testId}
        text={level === STATUS_ERROR ? STATUS_ERROR_SYMBOL : ''}
        icon={level !== STATUS_ERROR}
        level={level}
        size={size}
      />
    </IconButton>
  );
}
