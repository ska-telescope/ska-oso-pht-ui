import React from 'react';
import { useTranslation } from 'react-i18next';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import SaveIcon from '@mui/icons-material/Save';
import { Proposal } from '../../../utils/types/proposal';
import PutProposal from '../../../services/axios/putProposal/putProposal';

export default function SaveButton({ onClick }) {
  const { t } = useTranslation('pht');
  const { application } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;

  const ClickFunction = async () => {
    const response = await PutProposal(getProposal(), 'Draft');
    onClick(response);
  };

  const title = t('saveBtn.label');

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
