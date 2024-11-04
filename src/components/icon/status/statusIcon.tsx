import React from 'react';
import { IconButton } from '@mui/material';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { t } from 'i18next';

interface StatusIconDisplayProps {
  error: string;
  level: number;
  onClick?: Function;
  size?: number;
}

export default function StatusIconDisplay({
  error,
  level,
  onClick = null,
  size = 25
}: StatusIconDisplayProps) {
  const action = () => {
    if (onClick !== null) {
      onClick();
    }
  };

  return (
    <IconButton aria-label="SensCalc Status" style={{ cursor: 'hand' }} onClick={() => action()}>
      <StatusIcon
        ariaTitle={t('sensitivityCalculatorResults.status', {
          status: t('statusLoading.' + level),
          error: error
        })}
        testId="statusId"
        icon
        level={level}
        size={size}
      />
    </IconButton>
  );
}
