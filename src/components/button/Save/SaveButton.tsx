import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import SaveIcon from '@mui/icons-material/Save';
import { Proposal } from '../../../services/types/proposal';
import PutProposal from '../../../services/axios/putProposal/putProposal';
import MockProposal from '../../../services/axios/getProposal/mockProposal';

export default function SaveButton({ onClick }) {
  const { t } = useTranslation('pht');
  
  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const getProposal = () => application.content2 as Proposal;

  const ClickFunction = async () => {
    const response = await PutProposal((getProposal()) as Proposal, 'Draft');
    onClick(response);
  };

  const title = t('button.save');

  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Secondary}
      icon={<SaveIcon />}
      label={title}
      onClick={ClickFunction}
      testId={`${title}Button`}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
