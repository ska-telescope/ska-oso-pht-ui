import React from 'react';
import { Box, Card, CardContent, CardHeader, Dialog, Grid, Typography } from '@mui/material';
import CancelButton from '../../button/cancel/CancelButton';
import { Alert, AlertColorTypes, SPACER_VERTICAL, Spacer } from '@ska-telescope/ska-gui-components';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { useTranslation } from 'react-i18next';

interface ObservationTargetResultsDisplayProps {
  open: boolean;
  onClose: Function;
  data: any;
  lvl: number;
  observation: any;
}

const SIZE = 30;
const SPACER_HEIGHT = 30;

export default function ObservationTargetResultsDisplay({
  open,
  onClose,
  data,
  lvl,
  observation
}: ObservationTargetResultsDisplayProps) {
  const handleClose = () => {
    onClose();
  };

  const { t } = useTranslation('pht');

  const displayElement = (eLabel: string, eValue: any) => (
    <Grid container direction="row" justifyContent="space-around" alignItems="center">
      <Grid item xs={5}>
        <Typography sx={{ align: 'right', fontWeight: 'normal' }} variant="body1">
          {eLabel}
        </Typography>
      </Grid>
      <Grid item xs={3}>
        <Typography sx={{ align: 'left', fontWeight: 'bold' }} variant="body1" id="sensitivityId">
          {eValue}
        </Typography>
      </Grid>
    </Grid>
  );

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      id="alert-dialog-proposal-change"
    >
      <Card variant="outlined">
        <CardHeader
          action={<CancelButton onClick={handleClose} label="button.close" />}
          avatar={
            <StatusIcon
              ariaTitle=""
              ariaDescription=""
              testId="statusId"
              icon
              level={lvl}
              size={SIZE}
              text="TREVOR"
            />
          }
          component={Box}
          title={t('sensitivityCalculatorResults.title')}
          titleTypographyProps={{
            align: 'center',
            fontWeight: 'bold',
            variant: 'h5'
          }}
        />
      </Card>
      <CardContent>
        {data ? (
          <>
            {displayElement(
              t('sensitivityCalculatorResults.continuumSensitivityWeighted'),
              '84.47 ujy/beam (6.10)'
            )}
            {displayElement(
              t('sensitivityCalculatorResults.continuumConfusionNoise'),
              '3.63 mjy/beam'
            )}
            {displayElement(
              t('sensitivityCalculatorResults.continuumTotalSensitivity'),
              '3.64 mjy/beam'
            )}
            {displayElement(
              t('sensitivityCalculatorResults.continuumSynthBeamSize'),
              '190.9" x 171.3"'
            )}
            {displayElement(
              t('sensitivityCalculatorResults.continuumSurfaceBrightnessSensitivity'),
              '3.40 K'
            )}
            <Spacer size={SPACER_HEIGHT} axis={SPACER_VERTICAL} />
            {displayElement(
              t('sensitivityCalculatorResults.spectralSensitivityWeighted'),
              '(2.62)'
            )}
            {displayElement(
              t('sensitivityCalculatorResults.spectralConfusionNoise'),
              '6.02 mjy/beam'
            )}
            {displayElement(
              t('sensitivityCalculatorResults.spectralTotalSensitivity'),
              '9.45 mjy/beam'
            )}
            {displayElement(
              t('sensitivityCalculatorResults.spectralSynthBeamSize'),
              '230.0" x 207.8"'
            )}
            {displayElement(
              t('sensitivityCalculatorResults.spectralSurfaceBrightnessSensitivity'),
              '6.04 K'
            )}
          </>
        ) : (
          <Alert testId="alertSensCalResultsId" color={AlertColorTypes.Error}>
            <Typography>{t('sensitivityCalculatorResults.noData')}</Typography>
          </Alert>
        )}
      </CardContent>
    </Dialog>
  );
}
