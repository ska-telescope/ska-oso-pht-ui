import React from 'react';
import { Box, Card, CardContent, CardHeader, Dialog, Grid, Typography } from '@mui/material';
import CancelButton from '../../../button/Cancel/Cancel';
import { Alert, AlertColorTypes, SPACER_VERTICAL, Spacer } from '@ska-telescope/ska-gui-components';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { useTranslation } from 'react-i18next';
import { STATUS_INITIAL } from '../../../../utils/constants';
import { SensCalcResults } from '../../../../utils/types/sensCalcResults';
import { presentUnits, presentValue } from '../../../../utils/present';

interface SensCalcDisplaySingleProps {
  open: boolean;
  onClose: Function;
  data: SensCalcResults;
}

const SIZE = 30;
const SPACER_HEIGHT = 30;

export default function SensCalcModalSingle({ open, onClose, data }: SensCalcDisplaySingleProps) {
  const handleClose = () => {
    onClose();
  };

  const { t } = useTranslation('pht');

  const displayElement = (eLabel: string, eValue: any, eUnits: string, eId: string) => {
    return (
      <Grid key={eId} container direction="row" justifyContent="space-around" alignItems="center">
        <Grid item xs={6}>
          <Typography id={eId} sx={{ align: 'right', fontWeight: 'normal' }} variant="body1">
            {eLabel}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography id={eId + 'Label'} sx={{ align: 'left', fontWeight: 'bold' }} variant="body1">
            {eId === 'targetName' ? eValue : presentValue(eValue, eId)}{' '}
            {eId === 'targetName' ? eUnits : presentUnits(eUnits)}
          </Typography>
        </Grid>
      </Grid>
    );
  };

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
          action={<CancelButton action={handleClose} title="button.close" />}
          avatar={
            <StatusIcon
              ariaTitle={t('sensitivityCalculatorResults.status', {
                status: t('statusLoading.' + data.statusGUI),
                error: ''
              })}
              ariaDescription=""
              testId="statusId"
              icon
              level={data.statusGUI}
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
        {data?.statusGUI !== STATUS_INITIAL ? (
          <>
            {displayElement(
              t('sensitivityCalculatorResults.targetName'),
              data.title,
              '',
              'targetName'
            )}
            {data?.section1?.length && <Spacer size={SPACER_HEIGHT} axis={SPACER_VERTICAL} />}
            {data?.section1?.map(rec =>
              displayElement(
                t('sensitivityCalculatorResults.' + rec.field),
                rec.value,
                rec.units,
                rec.field
              )
            )}
            {data?.section2?.length && <Spacer size={SPACER_HEIGHT} axis={SPACER_VERTICAL} />}
            {data?.section2?.map(rec =>
              displayElement(
                t('sensitivityCalculatorResults.' + rec.field),
                rec.value,
                rec.units,
                rec.field
              )
            )}
            {data?.section3?.length && <Spacer size={SPACER_HEIGHT} axis={SPACER_VERTICAL} />}
            {data?.section3?.map(rec =>
              displayElement(
                t('sensitivityCalculatorResults.' + rec.field),
                rec.value,
                rec.units,
                rec.field
              )
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
