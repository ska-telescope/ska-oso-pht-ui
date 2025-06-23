import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import Icon from '../icon/Icon';

interface CreateIconProps {
  disabled?: boolean;
  onClick?: Function;
  toolTip?: string;
}

export default function CreateIcon({
  disabled = false,
  onClick = null,
  toolTip = ''
}: CreateIconProps) {
  return (
    <Icon
      disabled={disabled}
      onClick={onClick}
      icon={<AddIcon />}
      testId="tickIcon"
      toolTip={toolTip}
    />
  );
}
