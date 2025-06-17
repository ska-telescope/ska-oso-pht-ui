import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BaseButton from '../Base/Button';

interface AssignButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
}

export default function AssignButton({
  disabled = false,
  action,
  primary = false,
  title = 'assigntBtn.label',
  testId = 'assigntButtonTestId',
  toolTip
}: AssignButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<ArrowForwardIcon />}
      primary={primary}
      testId={testId}
      title={title}
      toolTip={toolTip}
    />
  );
}
