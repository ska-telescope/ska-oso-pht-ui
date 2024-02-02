import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import AddIcon from '@mui/icons-material/Add';

interface AddTargetButtonProps {
  disabled: boolean;
  onClick: Function;
}

export default function AddTargetButton({ disabled, onClick }: AddTargetButtonProps) {
  const { t } = useTranslation('pht');

  const title = t('button.addTarget');

  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Secondary}
      icon={<AddIcon />}
      label={title}
      onClick={onClick}
      testId={`${title}Button`}
      variant={ButtonVariantTypes.Contained}
      disabled={disabled}
    />
  );
}
