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
  size = 25,
  text = '',
  testId,
  toolTip = ''
}: StatusIconDisplayProps) {
  return (
    <StatusIcon
      ariaDescription={ariaDescription}
      ariaTitle={ariaTitle}
      disabled={disabled}
      testId={testId}
      toolTip={toolTip}
      text={text ? text : level === STATUS_ERROR ? STATUS_ERROR_SYMBOL : ''}
      icon={!text && level !== STATUS_ERROR}
      level={level}
      size={size}
    />
  );
}
