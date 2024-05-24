import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';

interface BaseButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  icon: JSX.Element;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
}

export default function BaseButton({
  disabled = false,
  action,
  title = 'button.add',
  icon,
  primary = false,
  testId,
  toolTip
}: BaseButtonProps) {
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
      ariaDescription={`${theTitle} Button`}
      color={primary ? ButtonColorTypes.Secondary : ButtonColorTypes.Inherit}
      disabled={disabled}
      icon={icon}
      label={theTitle}
      onClick={ClickFunction}
      testId={testId ? testId : 'BaseButton'}
      toolTip={toolTip?.length ? t(toolTip) : ''}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
