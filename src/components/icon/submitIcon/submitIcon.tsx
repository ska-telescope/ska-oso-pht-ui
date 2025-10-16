import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import Icon from '../icon/Icon';

interface SubmitIconProps {
  disabled?: boolean;
  onClick: Function;
  toolTip?: string;
}

export default function SubmitIcon({ disabled = false, onClick, toolTip = '' }: SubmitIconProps) {
  return (
    <Icon
      disabled={disabled}
      onClick={onClick}
      icon={<SendOutlinedIcon />}
      testId="submitIcon"
      toolTip={toolTip}
    />
  );
}
