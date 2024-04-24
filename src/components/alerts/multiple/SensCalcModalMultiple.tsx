import React from 'react';
import { Box, Card, CardContent, CardHeader, Dialog, Grid, Typography } from '@mui/material';
import CancelButton from '../../../button/cancel/CancelButton';
import { Alert, AlertColorTypes, SPACER_VERTICAL, Spacer } from '@ska-telescope/ska-gui-components';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { useTranslation } from 'react-i18next';
import { SensCalcResult } from '../../../../services/axios/sensitivityCalculator/getSensitivityCalculatorAPIData';
import { STATUS_INITIAL } from '../../../../utils/constants';

interface SensCalcDisplayMultipleProps {
  open: boolean;
  onClose: Function;
  data: SensCalcResult;
}

const SIZE = 30;
const SPACER_HEIGHT = 30;

export default function SensCalcDisplayMultiple({
  open,
  onClose,
  data
}: SensCalcDisplayMultipleProps) {
  const handleClose = () => {
    onClose();
  };

  const { t } = useTranslation('pht');

  const displayElement = (eLabel: string, eValue: any, eId: string) => (
    <Grid container direction="row" justifyContent="space-around" alignItems="center">
      <Grid item xs={6}>
        <Typography
          id={eId + 'Label'}
          sx={{ align: 'right', fontWeight: 'normal' }}
          variant="body1"
        >
          {eLabel}
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography id={eId + 'Label'} sx={{ align: 'left', fontWeight: 'bold' }} variant="body1">
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
              level={data.status}
              size={SIZE}
              text=""
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
        {data?.status !== STATUS_INITIAL ? (
          <>
            {data?.section1?.map(rec =>
              displayElement(t('sensitivityCalculatorResults.' + rec.field), rec.value, rec.field)
            )}
            {data?.section2?.length && <Spacer size={SPACER_HEIGHT} axis={SPACER_VERTICAL} />}
            {data?.section2?.map(rec =>
              displayElement(t('sensitivityCalculatorResults.' + rec.field), rec.value, rec.field)
            )}
            {data?.section3?.length && <Spacer size={SPACER_HEIGHT} axis={SPACER_VERTICAL} />}
            {data?.section3?.map(rec =>
              displayElement(t('sensitivityCalculatorResults.' + rec.field), rec.value, rec.field)
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
