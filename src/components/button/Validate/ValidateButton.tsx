import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import PostProposalValidate from '../../../services/axios/postProposalValidate/postProposalValidate';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { Proposal } from '../../../services/types/proposal';

export default function ValidateButton({ onClick }) {
  const { t } = useTranslation('pht');
  const { application } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;

  const ClickFunction = async () => {
    const response = await PostProposalValidate(getProposal());
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
