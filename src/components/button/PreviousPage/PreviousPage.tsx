import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

interface PreviousPageProps {
  label?: string;
  page?: number;
  action: Function;
}

export default function PreviousPageButton({ label = '', page = 0, action }: PreviousPageProps) {
  return (
    <Button
      ariaDescription={`${label}Button`}
      color={ButtonColorTypes.Inherit}
      icon={<ArrowBackIosIcon />}
      label={label}
      onClick={action}
      testId={`${label}Button`}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
