import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ButtonColorTypes,
  ButtonSizeTypes,
  ButtonVariantTypes
} from '@ska-telescope/ska-gui-components';

interface BaseButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  icon: string | JSX.Element;
  primary?: boolean;
  size?: string;
  testId?: string;
  toolTip?: string;
}

export default function BaseButton({
  disabled = false,
  action,
  title = 'baseBtn.label',
  icon,
  primary = false,
  size = ButtonSizeTypes.Medium,
  testId = 'baseButtonTestId',
  toolTip = ''
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

  const theTitle = title === '' ? '' : t(title);
  const theToolTip = toolTip.length ? t(toolTip) : '';

  return (
    <Button
      ariaDescription={`${theTitle} Button`}
      color={primary ? ButtonColorTypes.Secondary : ButtonColorTypes.Inherit}
      disabled={disabled}
      size={size}
      icon={icon}
      label={theTitle}
      onClick={ClickFunction}
      testId={testId}
      toolTip={theToolTip}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
