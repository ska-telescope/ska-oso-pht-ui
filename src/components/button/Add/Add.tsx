import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import BaseButton from '../Base/Button';

interface AddButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
}

export default function AddButton({
  disabled = false,
  action,
  primary = false,
  title = 'button.add',
  testId = 'addButtonTestId',
  toolTip
}: AddButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<AddIcon />}
      primary={primary}
      testId={testId}
      title={title}
      toolTip={toolTip}
    />
  );
}
