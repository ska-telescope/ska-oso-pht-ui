import React from 'react';
import CheckIcon from '@mui/icons-material/Check';
import Icon from '../icon/Icon';

interface TickIconProps {
  disabled?: boolean;
  onClick?: Function;
  toolTip?: string;
}

export default function TickIcon({
  disabled = false,
  onClick = null,
  toolTip = ''
}: TickIconProps) {
  return (
    <Icon
      disabled={disabled}
      onClick={onClick}
      icon={<CheckIcon />}
      testId="tickIcon"
      toolTip={toolTip}
    />
  );
}
