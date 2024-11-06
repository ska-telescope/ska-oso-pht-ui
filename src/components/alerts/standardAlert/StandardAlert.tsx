import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Typography } from '@mui/material';
import { Alert, AlertColorTypes, StatusIcon } from '@ska-telescope/ska-gui-components';
import CloseIcon from '../../../components/icon/closeIcon/closeIcon';

interface StandardAlertProps {
  color: AlertColorTypes;
  testId: string;
  text: string;
  closeFunc?: Function;
}

const FONTSIZE = 25;

export default function StandardAlert({ color, testId, text, closeFunc }: StandardAlertProps) {
  const { t } = useTranslation('pht');
  function getLevel(color: AlertColorTypes): number {
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
        spacing={2}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid item xs={1}>
          <StatusIcon icon level={getLevel(color)} size={FONTSIZE} testId={testId + 'Icon'} />
        </Grid>
        <Grid item xs={10}>
          <Typography id="standardAlertId">{text}</Typography>
        </Grid>
        <Grid xs={1}>
          {closeFunc ? (
            <CloseIcon onClick={() => closeFunc()} toolTip={t('button.close')} />
          ) : (
            <></>
          )}
        </Grid>
      </Grid>
    </Alert>
  );
}
