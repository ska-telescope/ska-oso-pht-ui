import React from 'react';
import { Grid, Typography, Fade, Box } from '@mui/material';
import { Alert, AlertColorTypes, StatusIcon } from '@ska-telescope/ska-gui-components';
import CloseIcon from '../../../components/icon/closeIcon/closeIcon';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { STATUS_ERROR_SYMBOL } from '@/utils/constants';

interface StandardAlertProps {
  color: typeof AlertColorTypes;
  gap?: number;
  testId: string;
  text: string;
  closeFunc?: () => void;
  fadeDuration?: number;
}

const FONTSIZE_0 = 20;
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
    setVisible(false);
    setTimeout(() => {
      setShouldRender(false);
      closeFunc?.();
    }, fadeDuration);
  };

  if (!shouldRender) return null;

  return (
    <Box sx={{ m: 0, p: 0 }}>
      <Fade in={visible} timeout={fadeDuration}>
        <div>
          <Alert color={color} testId={testId} sx={{ p: 0 }}>
            <Grid
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                alignItems: 'center',
                padding: 0,
                minHeight: 'auto'
              }}
            >
              <Box sx={{ p: 0, display: 'flex', alignItems: 'center' }}>
                <StatusIcon
                  ariaDescription=" "
                  ariaTitle=" "
                  icon={AlertColorTypes.Error !== color}
                  level={getLevel(color)}
                  size={gap === 0 ? FONTSIZE_0 : FONTSIZE_1}
                  testId={`${testId}Icon`}
                  text={AlertColorTypes.Error === color ? STATUS_ERROR_SYMBOL : ''}
                  toolTip=" "
                />
              </Box>
              <Box sx={{ p: 0, pl: 2, display: 'flex', alignItems: 'center' }}>
                <Typography
                  id="standardAlertId"
                  sx={{
                    fontSize: '0.875rem',
                    lineHeight: 1.2,
                    margin: 0,
                    padding: 0
                  }}
                >
                  {text}
                </Typography>
              </Box>
              {closeFunc && (
                <Box sx={{ p: 0, pl: 2, display: 'flex', alignItems: 'center' }}>
                  <CloseIcon onClick={handleClose} padding={0} toolTip={t('closeBtn.label')} />
                </Box>
              )}
            </Grid>
          </Alert>
        </div>
      </Fade>
    </Box>
  );
}
