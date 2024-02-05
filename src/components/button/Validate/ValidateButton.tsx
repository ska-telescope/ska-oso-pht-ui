import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import PostProposalValidate from '../../../services/axios/postProposalValidate/postProposalValidate';

export default function ValidateButton({ onClick, proposal }) {
  const { t } = useTranslation('pht');

  const ClickFunction = async () => {
    const response = await PostProposalValidate(proposal);
    onClick(response);
  };

  const title = t('button.validate');

  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Secondary}
      icon={<FactCheckIcon />}
      label={title}
      onClick={ClickFunction}
      testId={`${title}Button`}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
