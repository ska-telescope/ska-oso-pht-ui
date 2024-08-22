import React from 'react';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import BaseButton from '../Base/Button';

interface PreviousPageButtonProps {
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  title?: string;
  toolTip?: string;
}

export default function PreviousPageButton({
  disabled = false,
  action,
  primary = false,
  title = 'button.add',
  testId,
  toolTip
}: PreviousPageButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<ArrowBackIosIcon />}
      primary={primary}
      testId={testId}
      title={title}
      toolTip={toolTip}
    />
  );
}
