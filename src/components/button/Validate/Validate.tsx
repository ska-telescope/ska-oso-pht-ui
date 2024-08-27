import React from 'react';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import BaseButton from '../Base/Button';

interface ValidateButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
}

export default function ValidateButton({
  disabled = false,
  action,
  title = 'validationBtn.label',
  primary = true,
  testId = 'validationBtnTestId',
  toolTip = 'validationBtn.tooltip'
}: ValidateButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<FactCheckIcon />}
      primary={primary}
      testId={testId}
      title={title}
      toolTip={toolTip}
    />
  );
}
