import BuildIcon from '@mui/icons-material/Build';
import Icon from '../icon/Icon';

interface TechnicalIconProps {
  disabled?: boolean;
  onClick: Function;
  toolTip?: string;
}

export default function TechnicalIcon({
  disabled = false,
  onClick,
  toolTip = ''
}: TechnicalIconProps) {
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
