import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import SaveIcon from '@mui/icons-material/Save';
import { Proposal } from '../../../services/types/proposal';
import EditProposal from '../../../services/axios/editProposal/editProposal';
// import mockProposalBackend from '../../../services/axios/getProposal/getProposal';
import mockProposal from '../../../services/axios/getProposal/getProposal';

export default function SaveButton({ onClick }) {
  const ClickFunction = async () => {
    const response = await EditProposal((mockProposal as unknown) as Proposal);
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
