import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import EmailIcon from '@mui/icons-material/Email';

interface TeamInviteButtonProps {
  disabled: boolean;
  onClick: Function;
}

export default function TeamInviteButton({ disabled, onClick }: TeamInviteButtonProps) {
  const { t } = useTranslation('darkMode');

  const title = t('button.sendInvite');

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
