'useClient';

import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import ValidateProposal from '../../../services/axios/validateProposal/validateProposal';

export default function ValidateButton({ onClick, proposal }) {
  const ClickFunction = async () => {
    const response = await ValidateProposal(proposal);
    onClick(response);
  };

  const title = 'Validate';

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
