import CancelIcon from '@mui/icons-material/Cancel';
import Icon from '../icon/Icon';

interface CloseIconProps {
  disabled?: boolean;
  onClick?: Function;
  padding?: number;
  toolTip?: string;
}

export default function CloseIcon({
  disabled = false,
  padding = 1,
  onClick = undefined,
  toolTip = ''
}: CloseIconProps) {
  return (
    <Icon
      disabled={disabled}
      onClick={onClick}
      icon={<CancelIcon />}
      testId="CloseIcon"
      toolTip={toolTip}
      sx={{ padding: padding }}
    />
  );
}
