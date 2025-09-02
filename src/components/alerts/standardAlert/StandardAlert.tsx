import { useTranslation } from 'react-i18next';
import { Grid, Typography } from '@mui/material';
import { Alert, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import CloseIcon from '../../../components/icon/closeIcon/closeIcon';
import StatusIconDisplay from '../../../components/icon/status/statusIcon';

interface StandardAlertProps {
  color: typeof AlertColorTypes;
  testId: string;
  text: string;
  closeFunc?: Function;
}

const FONTSIZE = 25;

export default function StandardAlert({ color, testId, text, closeFunc }: StandardAlertProps) {
  const { t } = useTranslation('pht');
  function getLevel(color: typeof AlertColorTypes): number {
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
  }

  return (
    <Alert color={color} testId={testId}>
      <Grid
        container
        spacing={1}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid>
          <StatusIconDisplay
            ariaDescription=" "
            ariaTitle=" "
            level={getLevel(color)}
            size={FONTSIZE}
            testId={testId + 'Icon'}
            toolTip=" "
          />
        </Grid>
        <Grid>
          <Typography id="standardAlertId">{text}</Typography>
        </Grid>
        <Grid>
          {closeFunc ? (
            <CloseIcon onClick={() => closeFunc()} toolTip={t('closeBtn.label')} />
          ) : (
            <></>
          )}
        </Grid>
      </Grid>
    </Alert>
  );
}
