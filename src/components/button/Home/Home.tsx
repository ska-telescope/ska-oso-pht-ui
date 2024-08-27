import React from 'react';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import BaseButton from '../Base/Button';
import { PATH } from '../../../utils/constants';

interface HomeButtonProps {
  title?: string;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
}

export default function HomeButton({
  disabled = false,
  title = 'homeBtn.label',
  primary = false,
  testId,
  toolTip = 'homeBtn.tooltip'
}: HomeButtonProps) {
  const navigate = useNavigate();

  const ClickFunction = () => {
    navigate(PATH[0]);
  };

  return (
    <BaseButton
      action={ClickFunction}
      disabled={disabled}
      icon={<HomeIcon />}
      primary={primary}
      testId={testId}
      title={title}
      toolTip={toolTip}
    />
  );
}
