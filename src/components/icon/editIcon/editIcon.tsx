import React from 'react';
import { EditRounded } from '@mui/icons-material';
import Icon from '../icon/Icon';

interface EditIconProps {
  disabled?: boolean;
  onClick: Function;
  toolTip?: string;
}

export default function EditIcon({ disabled = false, onClick, toolTip = '' }: EditIconProps) {
  return (
    <Icon
      disabled={disabled}
      onClick={onClick}
      icon={<EditRounded />}
      testId="editIcon"
      toolTip={toolTip}
    />
  );
}
