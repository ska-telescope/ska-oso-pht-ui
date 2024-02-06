import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import CheckIcon from '@mui/icons-material/Check';
import PutProposal from '../../../services/axios/putProposal/putProposal';
import {Proposal} from "../../../services/types/proposal";
import MockProposal from '../../../services/axios/getProposal/mockProposal';

interface ConfirmButtonProps {
  onClick: Function;
}

export default function ConfirmButton({ onClick }: ConfirmButtonProps) {
  const { t } = useTranslation('pht');

  const title = t('button.confirm');

  const ClickFunction = async () => {
    const response = await PutProposal((MockProposal as unknown) as Proposal, 'Submitted');
    onClick(response);
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
