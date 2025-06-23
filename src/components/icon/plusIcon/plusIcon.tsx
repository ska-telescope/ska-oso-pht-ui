import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import Icon from '../icon/Icon';

interface PlusIconProps {
  disabled?: boolean;
  onClick?: Function;
  toolTip?: string;
}

export default function PlusIcon({
  disabled = false,
  onClick = null,
  toolTip = ''
}: PlusIconProps) {
  return (
    <Icon
      disabled={disabled}
      onClick={onClick}
      icon={<AddIcon />}
      testId="plusIcon"
      toolTip={toolTip}
    />
  );
}
