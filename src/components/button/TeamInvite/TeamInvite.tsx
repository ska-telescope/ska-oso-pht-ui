import React from 'react';
import EmailIcon from '@mui/icons-material/Email';
import BaseButton from '../Base/Button';
interface TeamInviteButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
}

export default function TeamInviteButton({
  disabled = false,
  action,
  primary = false,
  title = 'button.sendInvite',
  testId = 'teamInviteButtonTestId',
  toolTip
}: TeamInviteButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<EmailIcon />}
      primary={primary}
      testId={testId}
      title={title}
      toolTip={toolTip}
    />
  );
}
