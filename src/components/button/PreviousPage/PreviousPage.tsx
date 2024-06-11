import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

interface PreviousPageProps {
  action: Function;
  disabled?: boolean;
  label?: string;
}

export default function PreviousPageButton({ action, disabled, label = '' }: PreviousPageProps) {
  return (
    <Button
      ariaDescription={`${label}Button`}
      color={ButtonColorTypes.Inherit}
      disabled={disabled}
      icon={<ArrowBackIosIcon />}
      label={label}
      onClick={action}
      testId={`${label}Button`}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
