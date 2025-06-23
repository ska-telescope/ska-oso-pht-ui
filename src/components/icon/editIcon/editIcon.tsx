import Edit from '@mui/icons-material/EditRounded';
import Icon from '../icon/Icon';

interface EditIconProps {
  disabled?: boolean;
  onClick: Function;
  toolTip?: string;
}

export default function EditIcon({ disabled = false, onClick, toolTip = '' }: EditIconProps) {
  return (
    <Icon
      disabled={disabled}
      onClick={onClick}
      icon={<Edit />}
      testId="editIcon"
      toolTip={toolTip}
    />
  );
}
