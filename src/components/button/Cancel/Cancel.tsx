import ClearIcon from '@mui/icons-material/Clear';
import BaseButton from '../Base/Button';

interface CancelButtonProps {
  ariaLabel?: string;
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
}

export default function CancelButton({
  ariaLabel = 'cancelBtn.label',
  disabled = false,
  action,
  title = 'cancelBtn.label',
  primary = false,
  testId = 'cancelButtonTestId',
  toolTip
}: CancelButtonProps) {
  return (
    <BaseButton
      action={action}
      ariaLabel={ariaLabel}
      disabled={disabled}
      icon={<ClearIcon />}
      primary={primary}
      testId={testId}
      title={title}
      toolTip={toolTip}
    />
  );
}
