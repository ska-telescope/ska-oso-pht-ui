import React from 'react';
import FileCopyIcon from '@mui/icons-material/FileCopyRounded';
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
      icon={<FileCopyIcon />}
      testId="cloneIcon"
      toolTip={toolTip}
    />
  );
}
