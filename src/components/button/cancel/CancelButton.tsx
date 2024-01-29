import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import ClearIcon from '@mui/icons-material/Clear';

const title = 'Cancel';

interface CancelButtonProps {
  onClick: Function;
}

export default function CancelButton({ onClick }: CancelButtonProps) {
  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Inherit}
      icon={<ClearIcon />}
      label={title}
      onClick={onClick}
      testId={`${title}Button`}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
