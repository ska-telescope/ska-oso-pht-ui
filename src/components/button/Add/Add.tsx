import AddIcon from '@mui/icons-material/Add';
import BaseButton from '../Base/Button';

interface AddButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  toolTip?: string;
}

export default function AddButton({
  disabled = false,
  action,
  primary = false,
  title = 'addBtn.label',
  toolTip
}: AddButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<AddIcon />}
      primary={primary}
      title={title}
      toolTip={toolTip}
    />
  );
}
