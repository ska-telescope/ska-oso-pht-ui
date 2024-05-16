import React from 'react';
import { FileCopyRounded } from '@mui/icons-material';
import Icon from '../icon/Icon';

interface CloneIconProps {
  disabled?: boolean;
  onClick: Function;
  toolTip?: string;
}

export default function CloneIcon({ disabled = false, onClick, toolTip = '' }: CloneIconProps) {
  return (
    <Icon
      disabled={disabled}
      onClick={onClick}
      icon={<FileCopyRounded />}
      testId="cloneIcon"
      toolTip={toolTip}
    />
  );
}
