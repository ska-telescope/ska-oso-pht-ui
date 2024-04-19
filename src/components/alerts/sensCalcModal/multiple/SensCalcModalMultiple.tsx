import React from 'react';
import { Box, Card, CardContent, CardHeader, Dialog, Typography } from '@mui/material';
import CancelButton from '../../../button/cancel/CancelButton';
import { Alert, AlertColorTypes, DataGrid } from '@ska-telescope/ska-gui-components';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { useTranslation } from 'react-i18next';
import Observation from '../../../../utils/types/observation';

interface SensCalcDisplayMultipleProps {
  open: boolean;
  onClose: Function;
  data: any;
  observation: Observation;
}

const SIZE = 30;

export default function SensCalcDisplayMultiple({
  open,
  onClose,
  data,
  observation
}: SensCalcDisplayMultipleProps) {
  const handleClose = () => {
    onClose();
  };

  const { t } = useTranslation('pht');

  const types = ['spectral', 'continuum'];
  const observationTypeLabel: string = types[observation.type];
  const label1 = `${observationTypeLabel}SensitivityWeighted`;
  const label2 = `${observationTypeLabel}ConfusionNoise`;
  const label3 = `${observationTypeLabel}TotalSensitivity`;
  const label4 = `${observationTypeLabel}SynthBeamSize`;
  const label5 = `${observationTypeLabel}SurfaceBrightnessSensitivity`;

  const columns = [
    {
      field: 'title',
      headerName: t('sensitivityCalculatorResults.targetName'),
      flex: 3
    },
    {
      field: 'field1',
      headerName: t(`sensitivityCalculatorResults.${label1}`),
      flex: 3
    },
    {
      field: 'field2',
      headerName: t(`sensitivityCalculatorResults.${label2}`),
      flex: 3
    },
    {
      field: 'field3',
      headerName: t(`sensitivityCalculatorResults.${label3}`),
      flex: 3
    },
    {
      field: 'field4',
      headerName: t(`sensitivityCalculatorResults.${label4}`),
      flex: 3
    },
    {
      field: 'field5',
      headerName: t(`sensitivityCalculatorResults.${label5}`),
      flex: 3
    },
    {
      field: 'field6',
      headerName: t('sensitivityCalculatorResults.spectralSensitivityWeighted'),
      flex: 3,
      optional: params => params.value !== null
    },
    {
      field: 'field7',
      headerName: t('sensitivityCalculatorResults.spectralConfusionNoise'),
      flex: 3,
      optional: params => params.value !== null
    },
    {
      field: 'field8',
      headerName: t('sensitivityCalculatorResults.spectralTotalSensitivity'),
      flex: 3,
      optional: params => params.value !== null
    },
    {
      field: 'field9',
      headerName: t('sensitivityCalculatorResults.spectralSynthBeamSize'),
      flex: 3,
      optional: params => params.value !== null
    },
    {
      field: 'field10',
      headerName: t('sensitivityCalculatorResults.spectralSurfaceBrightnessSensitivity'),
      flex: 3,
      optional: params => params.value !== null
    },

    {
      field: 'field11',
      headerName: t('sensitivityCalculatorResults.continuumIntegrationTime'),
      flex: 3,
      optional: params => params.value !== null
    },
    {
      field: 'status',
      headerName: '',
      sortable: false,
      width: 50,
      disableClickEventBubbling: true,
      renderCell: (e: { row: any }) => {
        return <StatusIcon ariaTitle="" testId="statusId" icon level={e.row.status} size={SIZE} />;
      }
    }
  ];
  const extendedColumns = [...columns];

  // Filter out optional columns that don't have data
  const filteredColumns = extendedColumns.filter(col => {
    if (col.optional) {
      return data.some(data => col.optional({ value: data[col.field] }));
    } else {
      return true;
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth="xl"
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
              level={5}
              size={SIZE}
              text=""
            />
          }
          component={Box}
          title={t('sensitivityCalculatorResults.title') + ' (' + observation.obset_id + ')'}
          titleTypographyProps={{
            align: 'center',
            fontWeight: 'bold',
            variant: 'h5'
          }}
        />
        <CardContent>
          {data ? (
            <DataGrid
              rows={data}
              columns={filteredColumns}
              height={500}
              showBorder={false}
              showMild
              testId="sensCalcDetailsList"
            />
          ) : (
            <Alert testId="alertSensCalResultsId" color={AlertColorTypes.Error}>
              <Typography>{t('sensitivityCalculatorResults.noData')}</Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
    </Dialog>
  );
}
