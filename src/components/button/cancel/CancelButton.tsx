import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import ClearIcon from '@mui/icons-material/Clear';

interface CancelButtonProps {
  onClick: Function;
  label?: string;
}

export default function CancelButton({ onClick, label = 'button.cancel' }: CancelButtonProps) {
  const { t } = useTranslation('pht');

  const title = t(label);

  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Inherit}
      icon={<ClearIcon />}
      label={title}
      onClick={onClick}
      testId={`${title}Button`}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
