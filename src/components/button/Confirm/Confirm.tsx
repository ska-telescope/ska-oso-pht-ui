import React from 'react';
import CheckIcon from '@mui/icons-material/Check';
import BaseButton from '../Base/Button';

interface ConfirmButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
}

export default function ConfirmButton({
  disabled = false,
  action,
  title = 'button.confirm',
  primary = false,
  testId = 'confirmButtonTestId',
  toolTip
}: ConfirmButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<CheckIcon />}
      primary={primary}
      testId={testId}
      title={title}
      toolTip={toolTip}
    />
  );
}
