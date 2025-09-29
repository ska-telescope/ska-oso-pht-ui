import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { IconButton } from '@mui/material';

interface StatusIconDisplayProps {
  ariaDescription: string;
  ariaTitle: string;
  disabled?: boolean;
  level: number;
  onClick?: Function;
  size?: number;
  text?: string;
  testId: string;
  toolTip?: string;
}

export default function StatusIconDisplay({
  ariaDescription,
  ariaTitle,
  disabled = false,
  level,
  onClick = () => {},
  size = 30,
  text = '',
  testId,
  toolTip = ''
}: StatusIconDisplayProps) {
  return (
    <IconButton
      aria-label={toolTip}
      disabled={disabled}
      onClick={() => onClick()}
      style={{ cursor: 'pointer' }}
    >
      <StatusIcon
        ariaDescription={ariaDescription}
        ariaTitle={ariaTitle}
        disabled={disabled}
        testId={testId}
        toolTip={toolTip}
        icon={text?.length > 0 ? false : true}
        level={level}
        size={size}
        iconOffset={0}
        iconSizingFactor={1}
      />
    </IconButton>
  );
}
