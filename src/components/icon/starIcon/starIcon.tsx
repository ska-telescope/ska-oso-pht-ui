import React from 'react';
import { StarRateRounded } from '@mui/icons-material';
import Icon from '../icon/Icon';

interface StarIconProps {
  disabled?: boolean;
  onClick?: Function;
  toolTip?: string;
}

export default function StarIcon({
  disabled = false,
  onClick = null,
  toolTip = ''
}: StarIconProps) {
  return (
    <Icon
      disabled={disabled}
      onClick={onClick}
      icon={<StarRateRounded />}
      testId="starIcon"
      toolTip={toolTip}
    />
  );
}
