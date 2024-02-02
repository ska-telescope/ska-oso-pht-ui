import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import CheckIcon from '@mui/icons-material/Check';

interface ConfirmButtonProps {
  onClick: Function;
}

export default function ConfirmButton({ onClick }: ConfirmButtonProps) {
  const { t } = useTranslation('pht');

  const title = t('button.confirm');

  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Secondary}
      icon={<CheckIcon />}
      label={title}
      onClick={onClick}
      testId={`${title}Button`}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
