import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import Icon from '../icon/Icon';

interface ArrowIconProps {
  disabled?: boolean;
  onClick: Function;
  testId?: string;
  toolTip?: string;
}

export default function ArrowIcon({
  disabled = false,
  onClick,
  testId = 'arrowIcon',
  toolTip = ''
}: ArrowIconProps) {
  return (
    <Icon
      disabled={disabled}
      onClick={onClick}
      icon={<KeyboardDoubleArrowRightIcon />}
      testId={testId}
      toolTip={toolTip}
    />
  );
}
