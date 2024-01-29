'useClient';

import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import PublishIcon from '@mui/icons-material/Publish';

const title = 'Submit';

interface SubmitButtonProps {
  disabled: boolean;
  onClick: Function;
}

export default function SubmitButton({ disabled, onClick }: SubmitButtonProps) {
  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Secondary}
      disabled={disabled}
      icon={<PublishIcon />}
      label={title}
      onClick={onClick}
      testId={`${title}Button`}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
