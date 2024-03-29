import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import AddIcon from '@mui/icons-material/Add';
import { PATH } from '../../../utils/constants';

export default function AddProposalButton() {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();

  const ClickFunction = () => {
    navigate(PATH[1]);
  };

  const title = t('addProposal.label');
  const toolTip = t('addProposal.toolTip');

  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Inherit}
      icon={<AddIcon />}
      label={title}
      onClick={ClickFunction}
      testId={`${title}Button`}
      toolTip={toolTip}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
