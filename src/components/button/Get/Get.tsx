import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import BaseButton from '../Base/Button';

interface GetButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
}

export default function GetButton({
  disabled = false,
  action,
  primary = false,
  title = 'getBtn.label',
  testId = 'getButtonTestId',
  toolTip
}: GetButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<ArrowDownwardIcon />}
      primary={primary}
      testId={testId}
      title={title}
      toolTip={toolTip}
    />
  );
}
