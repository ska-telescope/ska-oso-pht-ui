import { IconButton, Tooltip } from '@mui/material';

interface IconProps {
  disabled?: boolean;
  onClick: Function | undefined;
  icon: JSX.Element;
  sx?: any;
  testId: string;
  toolTip: string;
}

export default function Icon({ disabled = false, icon, onClick, sx, testId, toolTip }: IconProps) {
  return (
    <Tooltip data-testid={testId} title={toolTip} arrow>
      <span>
        <IconButton
          aria-label={toolTip}
          disabled={disabled}
          onClick={() => (onClick ? onClick() : null)}
          style={{ cursor: 'pointer' }}
          sx={sx}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
}
