import React from 'react';
import { t } from 'i18next';
import { Grid, IconButton } from '@mui/material';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import SensCalcModalSingle from '../../alerts/sensCalcModal/single/SensCalcModalSingle';
import { OBS_TYPES, STATUS_OK } from '../../../utils/constants';
import { displayUnits } from '../../../utils/helpers';

const SIZE = 20;

const TOTAL_SENSE = 'TotalSensitivity';
const BEAM_SIZE = 'SynthBeamSize';
const VALUE = 'value';
const UNITS = 'units';
const SHOW_ERROR_ON_LINE = false; // Leave this as I expect this will return

interface SensCalcDisplaySingleProps {
  sensCalc: any;
  show: boolean;
}

export default function SensCalcDisplaySingle({ sensCalc, show }: SensCalcDisplaySingleProps) {
  const [openDialog, setOpenDialog] = React.useState(false);

  const IconClicked = () => {
    setOpenDialog(true);
  };

  const hasError = () => sensCalc?.error?.length > 0;

  const FieldFetch: any = (type: string, suffix: string) => {
    const observationTypeLabel: string = sensCalc?.hasOwnProperty('section2')
      ? OBS_TYPES[1]
      : OBS_TYPES[0];
    if (sensCalc?.section1) {
      const result = sensCalc?.section1.find(
        item => item.field === `${observationTypeLabel}${suffix}`
      );
      return result ? result[type] : '';
    }
    return '';
  };

  return (
    <>
      {show && (
        <Grid container direction="row" justifyContent="flex-start" alignItems="center">
          <Grid item xs={2}>
            <IconButton
              style={{ cursor: 'hand' }}
              onClick={sensCalc?.statusGUI === STATUS_OK ? IconClicked : null}
            >
              <StatusIcon
                ariaTitle={t('sensitivityCalculatorResults.status', {
                  status: sensCalc?.statusGUI ? t('statusLoading.' + sensCalc?.statusGUI) : '',
                  error: sensCalc?.error
                })}
                testId="statusId"
                icon
                level={sensCalc?.statusGUI}
                size={SIZE}
              />
            </IconButton>
          </Grid>
          {!hasError() && (
            <Grid item xs={5}>
              {`${FieldFetch(VALUE, TOTAL_SENSE)} ${displayUnits(FieldFetch(UNITS, TOTAL_SENSE))}`}
            </Grid>
          )}
          {!hasError() && (
            <Grid item xs={5}>
              {`${FieldFetch(VALUE, BEAM_SIZE)} ${displayUnits(FieldFetch(UNITS, BEAM_SIZE))}`}
            </Grid>
          )}
          {hasError() && (
            <Grid item xs={10}>
              {SHOW_ERROR_ON_LINE && sensCalc?.error}
            </Grid>
          )}
        </Grid>
      )}
      {openDialog && (
        <SensCalcModalSingle
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          data={sensCalc}
        />
      )}
    </>
  );
}
