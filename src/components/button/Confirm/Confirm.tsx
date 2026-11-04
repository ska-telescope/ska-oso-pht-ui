import CheckIcon from '@mui/icons-material/Check';
import BaseButton from '../Base/Button';

interface ConfirmButtonProps {
  ariaLabel?: string;
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  toolTip?: string;
}

export default function ConfirmButton({
  disabled = false,
  ariaLabel = 'confirmBtn.label',
  action,
  title = 'confirmBtn.label',
  primary = false,
  toolTip
}: ConfirmButtonProps) {
  return (
    <BaseButton
      action={action}
      ariaLabel={ariaLabel}
      disabled={disabled}
      icon={<CheckIcon />}
      primary={primary}
      title={title}
      toolTip={toolTip}
    />
  );
}
