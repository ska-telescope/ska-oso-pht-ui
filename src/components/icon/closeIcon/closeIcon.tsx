import React from 'react';
import CancelIcon from '@mui/icons-material/Cancel';
import Icon from '../icon/Icon';

interface CloseIconProps {
  disabled?: boolean;
  onClick: Function;
  toolTip?: string;
}

export default function CloseIcon({ disabled = false, onClick, toolTip = '' }: CloseIconProps) {
  return (
    <Icon
      disabled={disabled}
      onClick={onClick}
      icon={<CancelIcon />}
      testId="CloseIcon"
      toolTip={toolTip}
    />
  );
}
