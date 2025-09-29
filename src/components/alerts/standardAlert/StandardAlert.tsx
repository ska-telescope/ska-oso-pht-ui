import React from 'react';
import { Grid, Typography, Fade, Box } from '@mui/material';
import { Alert, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import CloseIcon from '../../../components/icon/closeIcon/closeIcon';
import StatusIconDisplay from '../../../components/icon/status/statusIcon';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface StandardAlertProps {
  color: typeof AlertColorTypes;
  gap?: number;
  testId: string;
  text: string;
  closeFunc?: () => void;
  fadeDuration?: number;
}

const FONTSIZE_0 = 26;
const FONTSIZE_1 = 30;

export default function StandardAlert({
  color,
  gap = 1,
  testId,
  text,
  closeFunc,
  fadeDuration = 0
}: StandardAlertProps) {
  const { t } = useScopedTranslation();
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
    setVisible(false); // triggers fade-out
    setTimeout(() => {
      setShouldRender(false); // unmount after fade
      closeFunc?.();
    }, fadeDuration);
  };

  if (!shouldRender) return null;

  return (
    <Box>
      <Fade in={visible} timeout={fadeDuration}>
        <div>
          <Alert color={color} testId={testId}>
            <Grid
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                alignItems: 'center',
                gap: gap
              }}
            >
              <Box p={gap}>
                <StatusIconDisplay
                  ariaDescription=" "
                  ariaTitle=" "
                  level={getLevel(color)}
                  size={gap === 0 ? FONTSIZE_0 : FONTSIZE_1}
                  testId={`${testId}Icon`}
                  toolTip=" "
                />
              </Box>
              <Box pl={2} pr={2}>
                <Typography id="standardAlertId">{text}</Typography>
              </Box>
              <Box>
                {closeFunc && (
                  <CloseIcon onClick={handleClose} padding={gap} toolTip={t('closeBtn.label')} />
                )}
              </Box>
            </Grid>
          </Alert>
        </div>
      </Fade>
    </Box>
  );
}
