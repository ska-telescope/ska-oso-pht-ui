'useClient';

import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import EmailIcon from '@mui/icons-material/Email';

export default function TeamInviteButton() {
  const ClickFunction = () => {
    // TODO
  };

  const title = 'Send Invitation';

  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Secondary}
      label={title}
      onClick={ClickFunction}
      icon={<EmailIcon />}
      testId={`${title}Button`}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
