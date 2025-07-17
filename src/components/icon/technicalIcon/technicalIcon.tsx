import BuildIcon from '@mui/icons-material/Build';
import Icon from '../icon/Icon';

interface ScienceIconProps {
  disabled?: boolean;
  onClick: Function;
  toolTip?: string;
}

// TODO : Update the icon import to the correct technical icon when available
export default function ScienceIcon({ disabled = false, onClick, toolTip = '' }: ScienceIconProps) {
  return (
    <Icon
      disabled={disabled}
      onClick={onClick}
      icon={<BuildIcon />}
      testId="technicalIcon"
      toolTip={toolTip}
    />
  );
}
