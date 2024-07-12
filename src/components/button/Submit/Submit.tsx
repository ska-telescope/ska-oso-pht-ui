import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import PublishIcon from '@mui/icons-material/Publish';

interface SubmitButtonProps {
  disabled: boolean;
  action: Function;
}

export default function SubmitButton({ disabled, action }: SubmitButtonProps) {
  const { t } = useTranslation('pht');

  const title = t('button.submit');

  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Secondary}
      disabled={disabled}
      icon={<PublishIcon />}
      label={title}
      onClick={action}
      testId={`${title}TestId`}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
