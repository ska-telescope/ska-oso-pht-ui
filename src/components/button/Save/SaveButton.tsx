import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import SaveIcon from '@mui/icons-material/Save';
import { Proposal } from '../../../services/types/proposal';
import PutProposal from '../../../services/axios/putProposal/putProposal';
import MockProposal from '../../../services/axios/getProposal/mockProposal';

export default function SaveButton({ onClick }) {
  const ClickFunction = async () => {
    const response = await PutProposal((MockProposal as unknown) as Proposal, 'Draft');
    onClick(response);
  };

  const title = 'Save';

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
