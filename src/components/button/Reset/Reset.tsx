import RestartAltIcon from '@mui/icons-material/RestartAlt';
import BaseButton from '../Base/Button';
interface ResetButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  toolTip?: string;
}

export default function ResetButton({
  disabled = false,
  action,
  primary = false,
  title = 'reset.label',
  toolTip
}: ResetButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<RestartAltIcon />}
      primary={primary}
      title={title}
      toolTip={toolTip}
    />
  );
}
