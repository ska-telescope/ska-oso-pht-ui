import React from 'react';
import { Chip, Fade, Box } from '@mui/material';
import { AlertColorTypes, StatusIcon } from '@ska-telescope/ska-gui-components';
import CancelIcon from '@mui/icons-material/Cancel';

interface StandardChipProps {
  color: typeof AlertColorTypes;
  testId: string;
  text: string;
  closeFunc?: () => void;
  fadeDuration?: number;
}

const FONTSIZE = 20;

export default function StandardChip({
  color,
  testId,
  text,
  closeFunc,
  fadeDuration = 0
}: StandardChipProps) {
  const [visible, setVisible] = React.useState(true);
  const [shouldRender, setShouldRender] = React.useState(true);

  const getLevel = (color: typeof AlertColorTypes): number => {
    switch (color) {
      case AlertColorTypes.Success:
        return 0;
      case AlertColorTypes.Error:
        return 1;
      case AlertColorTypes.Warning:
        return 2;
      case AlertColorTypes.Info:
      default:
        return 4;
    }
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      setShouldRender(false);
      if (closeFunc) {
        closeFunc();
      }
    }, fadeDuration);
  };

  if (!shouldRender) return null;

  return (
    <Box p={0.5}>
      <Fade in={visible} timeout={fadeDuration}>
        <div>
          <Chip
            variant="outlined"
            data-testid={testId}
            label={text}
            icon={
              <Box p={0.5} pt={1.5}>
                <StatusIcon
                  ariaDescription=" "
                  ariaTitle=" "
                  level={getLevel(color)}
                  size={FONTSIZE}
                  testId={`${testId}Icon`}
                  toolTip=" "
                />
              </Box>
            }
            onDelete={handleClose}
            deleteIcon={<CancelIcon />}
            sx={{
              fontWeight: 400,
              borderColor: themeColor(color),
              borderWidth: 2
            }}
          />
        </div>
      </Fade>
    </Box>
  );
}

// Optional: map AlertColorTypes to theme colors
function themeColor(color: typeof AlertColorTypes): string {
  switch (color) {
    case AlertColorTypes.Success:
      return 'success.main';
    case AlertColorTypes.Error:
      return 'error.main';
    case AlertColorTypes.Warning:
      return 'warning.main';
    case AlertColorTypes.Info:
    default:
      return 'info.main';
  }
}
