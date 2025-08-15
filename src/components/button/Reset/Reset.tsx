import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Box } from '@mui/material';
import { ButtonSizeTypes } from '@ska-telescope/ska-gui-components';
import BaseButton from '../Base/Button';

interface ResetButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
  size?: typeof ButtonSizeTypes;
}

export default function ResetButton({
  disabled = false,
  action,
  title = 'reset.label',
  primary = false,
  testId = 'resetButtonTestId',
  toolTip,
  size = ButtonSizeTypes.Small
}: ResetButtonProps) {
  return (
    <Box pb={1}>
      <BaseButton
        action={action}
        disabled={disabled}
        icon={<RestartAltIcon />}
        primary={primary}
        size={size}
        testId={testId}
        title={title}
        toolTip={toolTip}
      />
    </Box>
  );
}
