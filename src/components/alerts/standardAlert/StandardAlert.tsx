import { useTranslation } from 'react-i18next';
import { Grid2, Typography } from '@mui/material';
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
      <Grid2
        container
        spacing={1}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid2>
          <StatusIconDisplay
            ariaDescription=" "
            ariaTitle=" "
            level={getLevel(color)}
            onClick={() => {}}
            size={FONTSIZE}
            testId={testId + 'Icon'}
            toolTip=" "
          />
        </Grid2>
        <Grid2>
          <Typography id="standardAlertId">{text}</Typography>
        </Grid2>
        <Grid2>
          {closeFunc ? (
            <CloseIcon onClick={() => closeFunc()} toolTip={t('closeBtn.label')} />
          ) : (
            <></>
          )}
        </Grid2>
      </Grid2>
    </Alert>
  );
}
