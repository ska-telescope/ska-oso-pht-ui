import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import AddIcon from '@mui/icons-material/Add';

interface AddButtonProps {
  title: string;
  navPath: string;
  disabled?: boolean;
}

export default function AddButton({ disabled = false, navPath, title = '' }: AddButtonProps) {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();

  const ClickFunction = () => {
    navigate(navPath);
  };

  const theTitle = t(title);

  return (
    <Button
      ariaDescription={`${theTitle}Button`}
      color={ButtonColorTypes.Secondary}
      disabled={disabled}
      icon={<AddIcon />}
      label={theTitle}
      onClick={ClickFunction}
      testId={'addButton'}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
