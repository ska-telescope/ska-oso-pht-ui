import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import FactCheckIcon from '@mui/icons-material/FactCheck';

export default function ValidateButton({ action, disabled = false, toolTip = '' }) {
  const { t } = useTranslation('pht');

  const title = t('validationBtn.label');

  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Secondary}
      disabled={disabled}
      icon={<FactCheckIcon />}
      label={title}
      onClick={action}
      testId="ValidateButton"
      toolTip={toolTip}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
