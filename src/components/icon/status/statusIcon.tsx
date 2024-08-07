import React from 'react';
import { IconButton } from '@mui/material';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { t } from 'i18next';

interface StatusIconDisplayProps {
  error: string;
  level: number;
  onClick: Function;
  size?: number;
}

export default function StatusIconDisplay({
  error,
  level,
  onClick,
  size = 25
}: StatusIconDisplayProps) {
  return (
    <IconButton aria-label="SensCalc Status" style={{ cursor: 'hand' }} onClick={() => onClick()}>
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
