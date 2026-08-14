import SaveIcon from '@mui/icons-material/Save';
import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/system';
import BaseButton from '../Base/Button';
import { useAutoClearingState } from '@/utils/hooks/useAutoClearingState';

interface SaveButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
  showCountdown?: boolean;
  autoSaveInterval?: number;
}

export default function SaveButton({
  disabled = false,
  action,
  autoSaveInterval = 0,
  title = 'saveBtn.label',
  primary = false,
  testId = 'saveButtonTestId',
  toolTip = 'saveBtn.tooltip',
  showCountdown = false
}: SaveButtonProps) {
  const theme = useTheme();
  const [countdown, setCountdown] = React.useState(autoSaveInterval);
  const [warn, setWarn] = useAutoClearingState(false, 600); // flashes the icon on auto-save

  // The countdown is tracked here as well as in state so the tick can decide
  // whether to save *outside* any setState updater. StrictMode double-invokes
  // updater functions in development, so triggering the save from inside one
  // sent two PutProposal calls - and two whole-proposal store writes - per tick.
  const countdownRef = React.useRef(autoSaveInterval);

  React.useEffect(() => {
    if (autoSaveInterval > 0) {
      const intervalId = setInterval(() => {
        const elapsed = countdownRef.current <= 1;
        countdownRef.current = elapsed ? autoSaveInterval : countdownRef.current - 1; // reset or decrement
        setCountdown(countdownRef.current);

        if (elapsed && typeof action === 'function') {
          action(true); // trigger auto-save; the flag suppresses the success toast
          setWarn(true); // switch to warning color, reverts on its own
        }
      }, 1000);

      return () => clearInterval(intervalId); // cleanup
    }
  }, [autoSaveInterval, action]);

  const iconWithCountdown = (
    <Box
      pr={1}
      position="relative"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
    >
      <SaveIcon
        sx={{
          fontSize: 18,
          color: showCountdown && warn ? theme.palette.warning.main : 'inherit',
          transition: 'color 0.3s ease'
        }}
      />
      {showCountdown && autoSaveInterval > 0 && (
        <CircularProgress
          variant="determinate"
          value={(countdown / autoSaveInterval) * 100}
          size={34}
          thickness={3}
          sx={{
            position: 'absolute',
            top: -8,
            left: -8,
            zIndex: 1,
            color: primary ? 'primary.main' : 'secondary.main',
            transition: 'all 0.3s linear'
          }}
        />
      )}
    </Box>
  );

  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={iconWithCountdown}
      primary={primary}
      testId={testId}
      title={title}
      toolTip={toolTip}
    />
  );
}
