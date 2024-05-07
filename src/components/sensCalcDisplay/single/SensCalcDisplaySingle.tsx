import React from 'react';
import { t } from 'i18next';
import { Grid, IconButton } from '@mui/material';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import SensCalcModalSingle from '../../alerts/sensCalcModal/single/SensCalcModalSingle';
import { OBS_TYPES, STATUS_OK } from '../../../utils/constants';

const SIZE = 20;

interface SensCalcDisplaySingleProps {
  row: any;
  show: boolean;
}

export default function SensCalcDisplaySingle({ row }: SensCalcDisplaySingleProps) {
  const [openDialog, setOpenDialog] = React.useState(false);

  const IconClicked = () => {
    setOpenDialog(true);
  };

  const TotalSensitivity: any = (type: string) => {
    const observationTypeLabel: string = OBS_TYPES[row?.sensCalc?.results?.section2 ? 0 : 1];
    if (row?.sensCalc?.section1) {
      const result = row?.sensCalc?.section1.find(
        item => item.field === `${observationTypeLabel}TotalSensitivity`
      );
      return result ? result[type] : '';
    }
    return '';
  };

  const IntegrationTime: any = type => {
    if (row?.sensCalc?.section3) {
      const result = row?.sensCalc?.section3.find(item => item.field === 'integrationTime');
      return result ? result[type] : '';
    }
    return '';
  };

  return (
    <>
      <Grid container direction="row" justifyContent="flex-start" alignItems="center">
        <Grid item xs={2}>
          <IconButton
            style={{ cursor: 'hand' }}
            onClick={row?.sensCalc?.status === STATUS_OK ? IconClicked : null}
          >
            <StatusIcon
              ariaTitle={t('sensitivityCalculatorResults.status', {
                status: t('statusValue.' + row?.sensCalc?.status),
                error: row?.sensCalc?.error
              })}
              testId="statusId"
              icon
              level={row.sensCalc?.status}
              size={SIZE}
            />
          </IconButton>
        </Grid>
        {row.sensCalc?.error?.length === 0 && (
          <Grid item xs={5}>
            {`${TotalSensitivity('value')} ${TotalSensitivity('units')}`}
          </Grid>
        )}
        {row.sensCalc?.error?.length === 0 && (
          <Grid item xs={5}>
            {`${IntegrationTime('value')} ${IntegrationTime('units')}`}
          </Grid>
        )}
        {row.sensCalc?.error?.length > 0 && (
          <Grid item xs={10}>
            {row?.sensCalc?.error}
          </Grid>
        )}
      </Grid>
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
