import React from 'react';
import PublishIcon from '@mui/icons-material/Publish';
import BaseButton from '../Base/Button';

interface SubmitButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
}

export default function SubmitButton({
  disabled = false,
  action,
  title = 'button.submit',
  primary = false,
  testId = 'submitBtnTestId',
  toolTip
}: SubmitButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<PublishIcon />}
      primary={primary}
      testId={testId}
      title={title}
      toolTip={toolTip}
    />
  );
}
