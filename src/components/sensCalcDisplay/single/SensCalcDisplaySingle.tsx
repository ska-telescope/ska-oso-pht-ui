import React from 'react';
import { t } from 'i18next';
import { Grid, IconButton } from '@mui/material';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import SensCalcModalSingle from '../../alerts/sensCalcModal/single/SensCalcModalSingle';
import { OBS_TYPES, STATUS_OK } from '../../../utils/constants';

const SIZE = 20;

const TOTAL_SENSE = 'TotalSensitivity';
const BEAM_SIZE = 'SynthBeamSize';
const VALUE = 'value';
const UNITS = 'units';

interface SensCalcDisplaySingleProps {
  row: any;
  show: boolean;
}

export default function SensCalcDisplaySingle({ row, show }: SensCalcDisplaySingleProps) {
  const [openDialog, setOpenDialog] = React.useState(false);

  const IconClicked = () => {
    setOpenDialog(true);
  };

  const hasError = () => row?.sensCalc?.error?.length > 0;

  const FieldFetch: any = (type: string, suffix: string) => {
    const observationTypeLabel: string = row?.sensCalc?.hasOwnProperty('section2')
      ? OBS_TYPES[1]
      : OBS_TYPES[0];
    if (row?.sensCalc?.section1) {
      const result = row?.sensCalc?.section1.find(
        item => item.field === `${observationTypeLabel}${suffix}`
      );
      return result ? result[type] : '';
    }
    return '';
  };

  /* RETAINED FOR A WHILE, UNTIL WE ARE SURE IT IS NOT NEEDED
  const IntegrationTime: any = type => {
    if (row?.sensCalc?.section3) {
      const result = row?.sensCalc?.section3.find(item => item.field === 'integrationTime');
      return result ? result[type] : '';
    }
    return '';
  };
  */

  return (
    <>
      {show && (
        <Grid container direction="row" justifyContent="flex-start" alignItems="center">
          <Grid item xs={2}>
            <IconButton
              style={{ cursor: 'hand' }}
              onClick={row?.sensCalc?.status === STATUS_OK ? IconClicked : null}
            >
              <StatusIcon
                ariaTitle={t('sensitivityCalculatorResults.status', {
                  status: t(`statusLoading.${  row?.sensCalc?.status}`),
                  error: row?.sensCalc?.error
                })}
                testId="statusId"
                icon
                level={row?.sensCalc?.status}
                size={SIZE}
              />
            </IconButton>
          </Grid>
          {!hasError() && (
            <Grid item xs={5}>
              {`${FieldFetch(VALUE, TOTAL_SENSE)} ${FieldFetch(UNITS, TOTAL_SENSE)}`}
            </Grid>
          )}
          {!hasError() && (
            <Grid item xs={5}>
              {`${FieldFetch(VALUE, BEAM_SIZE)} ${FieldFetch(UNITS, BEAM_SIZE)}`}
            </Grid>
          )}
          {hasError() && (
            <Grid item xs={10}>
              {row?.sensCalc?.error}
            </Grid>
          )}
        </Grid>
      )}
      {openDialog && (
        <SensCalcModalSingle
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          data={row?.sensCalc}
        />
      )}
    </>
  );
}
