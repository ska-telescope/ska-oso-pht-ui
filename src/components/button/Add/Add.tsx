import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import AddIcon from '@mui/icons-material/Add';

interface AddButtonProps {
  title: string;
  action: string | Function;
  disabled?: boolean;
  color?: ButtonColorTypes;
}

export default function AddButton({
  disabled = false,
  action,
  title = '',
  color = ButtonColorTypes.Secondary
}: AddButtonProps) {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();

  const ClickFunction = () => {
    if (typeof action === 'string') {
      navigate(action);
    } else {
      action();
    }
  };

  const theTitle = t(title);

  return (
    <Button
      ariaDescription={`${theTitle}Button`}
      color={color}
      disabled={disabled}
      icon={<AddIcon />}
      label={theTitle}
      onClick={ClickFunction}
      testId={'addButton'}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
