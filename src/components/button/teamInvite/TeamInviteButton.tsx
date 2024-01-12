import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import EmailIcon from '@mui/icons-material/Email';

interface TeamInviteButtonProps {
  disabled: boolean;
  onClick: Function;
}

export default function TeamInviteButton({ disabled, onClick }: TeamInviteButtonProps) {
  const title = 'Send Invitation';

  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Secondary}
      label={title}
      onClick={onClick}
      icon={<EmailIcon />}
      testId={`${title}Button`}
      variant={ButtonVariantTypes.Contained}
      disabled={disabled}
    />
  );
}
