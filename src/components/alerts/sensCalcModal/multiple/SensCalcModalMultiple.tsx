import React from 'react';
import { Box, Card, CardContent, CardHeader, Dialog, Stack, Typography } from '@mui/material';
import CancelButton from '../../../button/cancel/CancelButton';
import { Alert, AlertColorTypes, DataGrid } from '@ska-telescope/ska-gui-components';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { useTranslation } from 'react-i18next';
import Observation from '../../../../utils/types/observation';
import { OBS_TYPES } from '../../../../utils/constants';

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

  const observationTypeLabel: string = OBS_TYPES[observation.type];
  const label1 = `${observationTypeLabel}SensitivityWeighted`;
  const label2 = `${observationTypeLabel}ConfusionNoise`;
  const label3 = `${observationTypeLabel}TotalSensitivity`;
  const label4 = `${observationTypeLabel}SynthBeamSize`;
  const label5 = `${observationTypeLabel}SurfaceBrightnessSensitivity`;

  function HeaderLine(str: string) {
    return <Typography>{str}</Typography>;
  }

  const headerDisplay = (inStr: string, inUnits: string) => {
    return (
      <Stack>
        {t(`sensitivityCalculatorResults.${inStr}`)
          .split(' ')
          .map(rec => HeaderLine(rec))}
      </Stack>
    );
  };

  const columns = [
    {
      field: 'title',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay('targetName', '')
    },
    {
      field: 'field1',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay(label1, '')
    },
    {
      field: 'field2',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay(label2, '')
    },
    {
      field: 'field3',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay(label3, '')
    },
    {
      field: 'field4',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay(label4, '')
    },
    {
      field: 'field5',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay(label5, '')
    },
    {
      field: 'field6',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay('spectralSensitivityWeighted', ''),
      optional: params => params.value !== null
    },
    {
      field: 'field7',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay('spectralConfusionNoise', ''),
      optional: params => params.value !== null
    },
    {
      field: 'field8',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay('spectralTotalSensitivity', ''),
      optional: params => params.value !== null
    },
    {
      field: 'field9',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay('spectralSynthBeamSize', ''),
      optional: params => params.value !== null
    },
    {
      field: 'field10',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () =>
        headerDisplay('spectralSurfaceBrightnessSensitivity', ''),
      optional: params => params.value !== null
    },
    {
      field: 'field11',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay('integrationTime', ''),
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
              columnHeaderHeight={100}
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
