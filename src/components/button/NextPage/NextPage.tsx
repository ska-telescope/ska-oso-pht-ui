import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface NextPageProps {
  label?: string;
  page?: number;
  action: Function;
  disabled?: boolean;
}

export default function NextPageButton({ label = '', page = 0, action, disabled }: NextPageProps) {
  const getIcon = () => (page < 0 ? <AddIcon /> : <ArrowForwardIosIcon />);

  return (
    <Button
      ariaDescription={`${label}Button`}
      color={ButtonColorTypes.Secondary}
      disabled={disabled}
      icon={getIcon()}
      label={label}
      onClick={action}
      testId={`${label}Button`}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
