import DeleteIcon from '@mui/icons-material/Delete';
import BaseButton from '../Base/Button';

interface DeleteButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  toolTip?: string;
}

export default function DeleteButton({
  disabled = false,
  action,
  title = 'deleteBtn.label',
  primary = false,
  toolTip
}: DeleteButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<DeleteIcon />}
      primary={primary}
      title={title}
      toolTip={toolTip}
    />
  );
}
