import { IconButton } from '@mui/material';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { STATUS_ERROR, STATUS_ERROR_SYMBOL } from '../../../utils/constants';

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
  onClick = undefined,
  size = 25,
  text = '',
  testId,
  toolTip = ''
}: StatusIconDisplayProps) {
  const clickFunc = () => {
    if (onClick) {
      onClick();
    }
  };

  const cursorType = () => (disabled ? 'not-allowed' : 'hand');

  return (
    <IconButton
      aria-label="SensCalc Status"
      disabled={disabled}
      style={{ cursor: cursorType() }}
      onClick={() => clickFunc()}
    >
      <StatusIcon
        ariaDescription={ariaDescription}
        ariaTitle={ariaTitle}
        testId={testId}
        toolTip={toolTip}
        text={text ? text : level === STATUS_ERROR ? STATUS_ERROR_SYMBOL : ''}
        icon={!text && level !== STATUS_ERROR}
        level={level}
        size={size}
      />
    </IconButton>
  );
}
