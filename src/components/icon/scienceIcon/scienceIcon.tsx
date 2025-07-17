import BiotechIcon from '@mui/icons-material/Biotech';
import Icon from '../icon/Icon';

interface ScienceIconProps {
  disabled?: boolean;
  onClick: Function;
  toolTip?: string;
}

export default function ScienceIcon({ disabled = false, onClick, toolTip = '' }: ScienceIconProps) {
  return (
    <Icon
      disabled={disabled}
      onClick={onClick}
      icon={<BiotechIcon />}
      testId="scienceIcon"
      toolTip={toolTip}
    />
  );
}
