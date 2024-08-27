import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import BaseButton from '../Base/Button';

interface NextPageButtonProps {
  action: string | Function;
  disabled?: boolean;
  page?: number;
  primary?: boolean;
  testId?: string;
  title?: string;
  toolTip?: string;
}

export default function NextPageButton({
  disabled = false,
  action,
  page = 0,
  primary = false,
  title = 'button.add',
  testId,
  toolTip
}: NextPageButtonProps) {
  const getIcon = () => (page < 0 ? <AddIcon /> : <ArrowForwardIosIcon />);

  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={getIcon()}
      primary={primary}
      testId={testId}
      title={title}
      toolTip={toolTip}
    />
  );
}
