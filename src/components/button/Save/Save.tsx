import React from 'react';
import SaveIcon from '@mui/icons-material/Save';
import BaseButton from '../Base/Button';

interface SaveButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
}

export default function SaveButton({
  disabled = false,
  action,
  title = 'saveBtn.label',
  primary = false,
  testId = 'saveButtonTestId',
  toolTip = 'saveBtn.tooltip'
}: SaveButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<SaveIcon />}
      primary={primary}
      testId={testId}
      title={title}
      toolTip={toolTip}
    />
  );
}
