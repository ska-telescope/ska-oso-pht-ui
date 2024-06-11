import React from 'react';
import DeleteIcon from '@mui/icons-material/DeleteRounded';
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
      icon={<DeleteIcon />}
      testId="trashIcon"
      toolTip={toolTip}
    />
  );
}
