import View from '@mui/icons-material/VisibilityRounded';
import Icon from '../icon/Icon';

interface ViewIconProps {
  disabled?: boolean;
  onClick: Function;
  testId?: string;
  toolTip?: string;
}

export default function ViewIcon({
  disabled = false,
  onClick,
  testId = 'viewIcon',
  toolTip = ''
}: ViewIconProps) {
  return (
    <Icon disabled={disabled} onClick={onClick} icon={<View />} testId={testId} toolTip={toolTip} />
  );
}
