import JoinLeftIcon from '@mui/icons-material/JoinLeft';
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
  title = 'assignBtn.label',
  testId = 'assignButtonTestId',
  toolTip = 'assignBtn.toolTip'
}: AssignButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<JoinLeftIcon />}
      primary={primary}
      testId={testId}
      title={title}
      toolTip={toolTip}
    />
  );
}
