import RestartAltIcon from '@mui/icons-material/RestartAlt';
import BaseButton from '../Base/Button';
interface ResetButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
}

export default function ResetButton({
  disabled = false,
  action,
  primary = false,
  title = 'reset.label',
  testId = 'resetButtonTestId',
  toolTip
}: ResetButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<RestartAltIcon />}
      primary={primary}
      testId={testId}
      title={title}
      toolTip={toolTip}
    />
  );
}
