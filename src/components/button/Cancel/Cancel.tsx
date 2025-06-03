import React from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import BaseButton from '../Base/Button';

interface CancelButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
}

export default function CancelButton({
  disabled = false,
  action,
  title = 'cancelBtn.label',
  primary = false,
  testId = 'cancelButtonTestId',
  toolTip
}: CancelButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<ClearIcon />}
      primary={primary}
      testId={testId}
      title={title}
      toolTip={toolTip}
    />
  );
}
