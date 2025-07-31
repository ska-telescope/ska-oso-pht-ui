import CheckIcon from '@mui/icons-material/Check';
import Icon from '../icon/Icon';

interface TickIconProps {
  disabled?: boolean;
  onClick: Function;
  sx?: any;
  toolTip?: string;
}

export default function TickIcon({
  disabled = false,
  onClick,
  sx = null,
  toolTip = ''
}: TickIconProps) {
  return (
    <Icon
      disabled={disabled}
      onClick={onClick}
      icon={<CheckIcon />}
      sx={sx}
      testId="tickIcon"
      toolTip={toolTip}
    />
  );
}
