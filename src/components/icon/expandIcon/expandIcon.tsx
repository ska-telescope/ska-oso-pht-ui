import { ChevronRight, ExpandMore } from '@mui/icons-material';
import Icon from '../icon/Icon';

interface ExpandIconProps {
  disabled?: boolean;
  expanded?: boolean;
  onClick: Function;
  ref?: any;
  toolTip?: string;
}

export default function ExpandIcon({
  disabled = false,
  expanded = false,
  onClick,
  ref,
  toolTip = ''
}: ExpandIconProps) {
  return (
    <Icon
      aria-label={`${expanded ? 'Collapse' : 'Expand'} details.`}
      aria-expanded={expanded}
      disabled={disabled}
      onClick={onClick}
      icon={expanded ? <ExpandMore /> : <ChevronRight />}
      ref={ref}
      testId="expandIcon"
      toolTip={toolTip}
    />
  );
}
