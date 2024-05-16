import React from 'react';
import { DeleteRounded } from '@mui/icons-material';
import Icon from '../icon/Icon';

interface TrashIconProps {
  disabled?: boolean;
  onClick: Function;
  toolTip?: string;
}

export default function TrashIcon({ disabled = false, onClick, toolTip = '' }: TrashIconProps) {
  return (
    <Icon
      disabled={disabled}
      onClick={onClick}
      icon={<DeleteRounded />}
      testId="trashIcon"
      toolTip={toolTip}
    />
  );
}
