import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import BaseButton from '../Base/Button';

interface DeleteButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
}

export default function DeleteButton({
  disabled = false,
  action,
  title = 'deleteBtn.label',
  primary = false,
  testId,
  toolTip
}: DeleteButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<DeleteIcon />}
      primary={primary}
      testId={testId}
      title={title}
      toolTip={toolTip}
    />
  );
}
