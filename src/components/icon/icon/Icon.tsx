import { IconButton, Tooltip } from '@mui/material';

interface IconProps {
  disabled?: boolean;
  onClick: Function | undefined;
  icon: JSX.Element;
  ref?: any;
  sx?: any;
  testId: string;
  toolTip: string;
}

export default function Icon({
  disabled = false,
  icon,
  onClick,
  ref,
  sx,
  testId,
  toolTip
}: IconProps) {
  return (
    <Tooltip data-testid={testId} title={toolTip} arrow>
      <span>
        <IconButton
          aria-label={toolTip}
          disabled={disabled}
          onClick={() => (onClick ? onClick() : null)}
          ref={ref}
          style={{ cursor: 'pointer' }}
          sx={sx}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
}
