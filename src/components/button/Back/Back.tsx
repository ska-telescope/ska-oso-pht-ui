import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BaseButton from '../Base/Button';

interface BackButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
}

export default function BackButton({
  disabled = false,
  action,
  primary = false,
  title = 'backBtn.label',
  testId = 'backButtonTestId',
  toolTip
}: BackButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<ArrowBackIcon />}
      primary={primary}
      testId={testId}
      title={title}
      toolTip={toolTip}
    />
  );
}
