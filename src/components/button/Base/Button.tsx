import { useNavigate } from 'react-router-dom';
import {
  Button,
  ButtonColorTypes,
  ButtonSizeTypes,
  ButtonVariantTypes
} from '@ska-telescope/ska-gui-components';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface BaseButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  icon: string | JSX.Element;
  primary?: boolean;
  size?: string;
  sx?: any;
  testId?: string;
  toolTip?: string;
  variant?: string;
}

export default function BaseButton({
  disabled = false,
  action,
  title = 'baseBtn.label',
  icon,
  primary = false,
  size = ButtonSizeTypes.Medium,
  sx = null,
  testId = 'baseButtonTestId',
  toolTip = '',
  variant = ButtonVariantTypes.Contained
}: BaseButtonProps) {
  const { t } = useScopedTranslation();
  const navigate = useNavigate();

  const ClickFunction = () => {
    if (typeof action === 'string') {
      navigate(action);
    } else {
      action();
    }
  };

  const theTitle = t(title);
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
      sx={sx}
      testId={testId}
      toolTip={theToolTip}
      variant={variant}
    />
  );
}
