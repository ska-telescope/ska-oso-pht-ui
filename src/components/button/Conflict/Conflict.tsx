import BlockIcon from '@mui/icons-material/Block';
import BaseButton from '../Base/Button';

interface ConflictButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
}

export default function ConflictButton({
  disabled = false,
  action,
  title = 'conflict.label',
  primary = true,
  testId = 'conflictBtnTestId',
  toolTip = 'conflict.tooltip'
}: ConflictButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<BlockIcon />}
      primary={primary}
      testId={testId}
      title={title}
      toolTip={toolTip}
    />
  );
}
