import React from 'react';
import { Box, Card, CardContent, CardHeader, Dialog, Stack, Typography } from '@mui/material';
import CancelButton from '../../../button/cancel/CancelButton';
import { Alert, AlertColorTypes, DataGrid } from '@ska-telescope/ska-gui-components';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { useTranslation } from 'react-i18next';
import Observation from '../../../../utils/types/observation';
import { OBS_TYPES } from '../../../../utils/constants';

interface SensCalcModalMultipleProps {
  open: boolean;
  onClose: Function;
  data: any;
  observation: Observation;
  level: number;
  levelError: string;
}

const SIZE = 30;

export default function SensCalcModalMultiple({
  open,
  onClose,
  data,
  observation,
  level,
  levelError
}: SensCalcModalMultipleProps) {
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

  let i = 0; // Just here so that the key warning is dealt with

  function HeaderLine(str: string) {
    return <Typography key={i++}>{str}</Typography>;
  }

  const headerDisplay = (inStr: string, inUnits: string) => {
    const unit = inUnits.length > 0 ? ' ' + t(`sensitivityCalculatorResults.${inUnits}`) : '';
    const sent = t(`sensitivityCalculatorResults.${inStr}`) + unit;
    return <Stack>{sent.split(' ').map(rec => HeaderLine(rec))}</Stack>;
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
      renderHeader: () => headerDisplay(label1, 'units1')
    },
    {
      field: 'field2',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay(label2, 'units2')
    },
    {
      field: 'field3',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay(label3, 'units3')
    },
    {
      field: 'field4',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay(label4, 'units4')
    },
    {
      field: 'field5',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay(label5, 'units5')
    },
    {
      field: 'field6',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay('spectralSensitivityWeighted', 'units6'),
      optional: params => params.value !== null
    },
    {
      field: 'field7',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay('spectralConfusionNoise', 'units7'),
      optional: params => params.value !== null
    },
    {
      field: 'field8',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay('spectralTotalSensitivity', 'units8'),
      optional: params => params.value !== null
    },
    {
      field: 'field9',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay('spectralSynthBeamSize', 'units9'),
      optional: params => params.value !== null
    },
    {
      field: 'field10',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay('spectralSurfaceBrightnessSensitivity', 'units10'),
      optional: params => params.value !== null
    },
    {
      field: 'field11',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay('integrationTime', 'units11'),
      optional: params => params.value !== null
    },
    {
      field: 'status',
      headerName: '',
      sortable: false,
      width: 50,
      disableClickEventBubbling: true,
      renderCell: (e: { row: { status: number; error: string } }) => {
        return (
          <StatusIcon
            ariaTitle={t('sensitivityCalculatorResults.status', {
              status: t('statusValue.' + e.row.status),
              error: e.row.error
            })}
            testId="statusId"
            icon
            level={e.row.status}
            size={SIZE}
          />
        );
      }
    }
  ];
  const extendedColumns = [...columns];

  // Filter out optional columns that don't have data
  const filteredColumns = extendedColumns.filter(col =>
    col.optional ? data.some(data => col.optional({ value: data[col.field] })) : true
  );

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
              ariaTitle={t('sensitivityCalculatorResults.status', {
                status: t('statusValue.' + level),
                error: levelError
              })}
              testId="statusId"
              icon
              level={level}
              size={SIZE}
              text=""
            />
          }
          component={Box}
          title={t('sensitivityCalculatorResults.title') + ' (' + observation.id + ')'}
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
