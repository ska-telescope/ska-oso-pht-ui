import React from 'react';
import { VisibilityRounded } from '@mui/icons-material';
import Icon from '../icon/Icon';

interface ViewIconProps {
  disabled?: boolean;
  onClick: Function;
  toolTip?: string;
}

export default function ViewIcon({ disabled = false, onClick, toolTip = '' }: ViewIconProps) {
  return (
    <Icon
      disabled={disabled}
      onClick={onClick}
      icon={<VisibilityRounded />}
      testId="trashIcon"
      toolTip={toolTip}
    />
  );
}
