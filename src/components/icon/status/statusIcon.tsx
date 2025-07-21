import { IconButton } from '@mui/material';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { STATUS_ERROR, STATUS_ERROR_SYMBOL } from '../../../utils/constants';

interface StatusIconDisplayProps {
  ariaDescription: string;
  ariaTitle: string;
  level: number;
  onClick: Function;
  size?: number;
  text?: string;
  testId: string;
  toolTip?: string;
}

export default function StatusIconDisplay({
  ariaDescription,
  ariaTitle,
  level,
  onClick,
  size = 25,
  text = '',
  testId,
  toolTip = ''
}: StatusIconDisplayProps) {
  return (
    <IconButton aria-label="SensCalc Status" style={{ cursor: 'hand' }} onClick={onClick()}>
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
