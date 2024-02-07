import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import CheckIcon from '@mui/icons-material/Check';

interface ConfirmButtonProps {
  onClick: Function;
  label?: string;
}

export default function ConfirmButton({ onClick, label = 'button.confirm' }: ConfirmButtonProps) {
  const { t } = useTranslation('pht');

  const title = t(label);

  const ClickFunction = () => {
    onClick();
  };

  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Secondary}
      icon={<CheckIcon />}
      label={title}
      onClick={ClickFunction}
      testId={`${title}Button`}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
