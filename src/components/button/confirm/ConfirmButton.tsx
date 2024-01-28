import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import CheckIcon from '@mui/icons-material/Check';

const title = 'Confirm';

interface ConfirmButtonProps {
  onClick: Function;
}

export default function ConfirmButton({ onClick }: ConfirmButtonProps) {
  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Secondary}
      icon={<CheckIcon />}
      label={title}
      onClick={onClick}
      testId={`${title}Button`}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
