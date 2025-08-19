import LockPersonIcon from '@mui/icons-material/LockPerson';
import Icon from '../icon/Icon';

interface LockIconProps {
  disabled?: boolean;
  onClick: Function;
  toolTip?: string;
}

export default function LockIcon({ disabled = false, onClick, toolTip = '' }: LockIconProps) {
  return (
    <Icon
      disabled={disabled}
      onClick={onClick}
      icon={<LockPersonIcon />}
      testId="lockIcon"
      toolTip={toolTip}
    />
  );
}
