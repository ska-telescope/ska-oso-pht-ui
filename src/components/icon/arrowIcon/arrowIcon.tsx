import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import Icon from '../icon/Icon';

interface ArrowIconProps {
  disabled?: boolean;
  onClick: Function;
  toolTip?: string;
}

export default function ArrowIcon({ disabled = false, onClick, toolTip = '' }: ArrowIconProps) {
  return (
    <Icon
      disabled={disabled}
      onClick={onClick}
      icon={<KeyboardDoubleArrowRightIcon />}
      toolTip={toolTip}
    />
  );
}
