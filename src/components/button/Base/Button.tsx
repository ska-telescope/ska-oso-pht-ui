import { useNavigate } from 'react-router-dom';
import {
  Button,
  ButtonColorTypes,
  ButtonSizeTypes,
  ButtonVariantTypes
} from '@ska-telescope/ska-gui-components';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useThemeA11y } from '@/utils/colors/ThemeAllyContext';

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
  const { settings } = useThemeA11y();

  const ClickFunction = () => {
    if (typeof action === 'string') {
      navigate(action);
    } else {
      action();
    }
  };

  const theTitle = t(title);
  const theToolTip = toolTip.length ? t(toolTip) : '';
  const accessibilitySx = {
    ...(settings.reducedMotion && {
      transition: 'none !important',
      animation: 'none !important'
    }),
    ...(settings.focusVisibleAlways && {
      '&:focus-visible': {
        outline: '2px solid #1976d2',
        outlineOffset: '2px'
      }
    })
  };

  return (
    <Button
      ariaDescription={`${theTitle} Button`}
      color={primary ? ButtonColorTypes.Secondary : ButtonColorTypes.Inherit}
      disabled={disabled}
      size={size}
      icon={icon}
      label={theTitle}
      onClick={ClickFunction}
      sx={{ ...sx, ...accessibilitySx }}
      testId={testId}
      toolTip={theToolTip}
      variant={variant}
    />
  );
}
