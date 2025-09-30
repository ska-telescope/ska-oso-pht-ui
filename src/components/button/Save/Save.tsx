import SaveIcon from '@mui/icons-material/Save';
import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/system';
import BaseButton from '../Base/Button';

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
  const [warn, setWarn] = React.useState(false);

  React.useEffect(() => {
    if (autoSaveInterval > 0) {
      const intervalId = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (typeof action === 'function') {
              action(); // trigger auto-save
              setWarn(true); // switch to warning color
              setTimeout(() => setWarn(false), 600); // revert after 600ms
            }
            return autoSaveInterval; // reset countdown
          }
          return prev - 1;
        });
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
