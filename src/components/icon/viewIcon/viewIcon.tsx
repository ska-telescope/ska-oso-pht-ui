import React from 'react';
import View from '@mui/icons-material/VisibilityRounded';
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
      icon={<View />}
      testId="viewIcon"
      toolTip={toolTip}
    />
  );
}
