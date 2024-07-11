import React from 'react';
import { Box, Card, CardContent, CardHeader, Dialog, Stack, Typography } from '@mui/material';
import CancelButton from '../../../button/Cancel/Cancel';
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

  React.useEffect(() => {
    console.log('TAS', data);
  }, [data]);

  function HeaderLine(str: string, bold: boolean) {
    return (
      <Typography sx={{ fontWeight: bold ? 'bold' : 'normal' }} key={i++}>
        {str}
      </Typography>
    );
  }

  const headerDisplay = (inStr: string, inUnits: string) => {
    const unit = inUnits.length > 0 ? ' ' + t(`sensitivityCalculatorResults.${inUnits}`) : '';
    const sent = t(`sensitivityCalculatorResults.${inStr}`) + unit;
    const arr = sent.split(' ');
    i = 0;
    let count = 0;
    return (
      <Stack>
        {arr.map(rec => {
          return HeaderLine(rec, unit.length > 0 && arr.length === ++count);
        })}
      </Stack>
    );
  };

  const extendedColumns = [
    ...[
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
        renderHeader: () => headerDisplay(label1, 'units1'),
        renderCell: (e: { row: { section1: { value: any }[] } }) =>
          e.row.section1 ? e.row.section1[0].value : ''
      },
      {
        field: 'field2',
        flex: 3,
        AutoResizeColumnHeadersHeight: true,
        renderHeader: () => headerDisplay(label2, 'units2'),
        renderCell: (e: { row: { section1: { value: any }[] } }) =>
          e.row.section1 ? e.row.section1[1].value : ''
      },
      {
        field: 'field3',
        flex: 3,
        AutoResizeColumnHeadersHeight: true,
        renderHeader: () => headerDisplay(label3, 'units3'),
        renderCell: (e: { row: { section1: { value: any }[] } }) =>
          e.row.section1 ? e.row.section1[2].value : ''
      },
      {
        field: 'field4',
        flex: 3,
        AutoResizeColumnHeadersHeight: true,
        renderHeader: () => headerDisplay(label4, 'units4'),
        renderCell: (e: { row: { section1: { value: any }[] } }) =>
          e.row.section1 ? e.row.section1[3].value : ''
      },
      {
        field: 'field5',
        flex: 3,
        AutoResizeColumnHeadersHeight: true,
        renderHeader: () => headerDisplay(label5, 'units5'),
        renderCell: (e: { row: { section1: { value: any }[] } }) =>
          e.row.section1 ? e.row.section1[4].value : ''
      },
      {
        field: 'field6',
        flex: 3,
        AutoResizeColumnHeadersHeight: true,
        renderHeader: () => headerDisplay('spectralSensitivityWeighted', 'units6'),
        renderCell: (e: { row: { section2: { value: any }[] } }) =>
          e.row.section2 ? e.row.section2[0].value : '',
        optional: params => params.value !== null
      },
      {
        field: 'field7',
        flex: 3,
        AutoResizeColumnHeadersHeight: true,
        renderHeader: () => headerDisplay('spectralConfusionNoise', 'units7'),
        renderCell: (e: { row: { section2: { value: any }[] } }) =>
          e.row.section2 ? e.row.section2[1].value : '',
        optional: params => params.value !== null
      },
      {
        field: 'field8',
        flex: 3,
        AutoResizeColumnHeadersHeight: true,
        renderHeader: () => headerDisplay('spectralTotalSensitivity', 'units8'),
        renderCell: (e: { row: { section2: { value: any }[] } }) =>
          e.row.section2 ? e.row.section2[2].value : '',
        optional: params => params.value !== null
      },
      {
        field: 'field9',
        flex: 3,
        AutoResizeColumnHeadersHeight: true,
        renderHeader: () => headerDisplay('spectralSynthBeamSize', 'units9'),
        renderCell: (e: { row: { section2: { value: any }[] } }) =>
          e.row.section2 ? e.row.section2[3].value : '',
        optional: params => params.value !== null
      },
      {
        field: 'field10',
        flex: 3,
        AutoResizeColumnHeadersHeight: true,
        renderHeader: () => headerDisplay('spectralSurfaceBrightnessSensitivity', 'units10'),
        renderCell: (e: { row: { section2: { value: any }[] } }) =>
          e.row.section2 ? e.row.section2[4].value : '',
        optional: params => params.value !== null
      },
      {
        field: 'field11',
        flex: 3,
        AutoResizeColumnHeadersHeight: true,
        renderHeader: () => headerDisplay('integrationTime', 'units11'),
        renderCell: (e: { row: { section3: { value: any }[] } }) =>
          e.row.section3 ? e.row.section3[0].value : '',
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
            <Box pt={1}>
              <StatusIcon
                ariaTitle={t('sensitivityCalculatorResults.status', {
                  status: e.row.status ? t('statusValue.' + e.row.status) : '',
                  error: e.row.error
                })}
                testId="statusId"
                icon
                level={e.row.status}
                size={SIZE}
              />
            </Box>
          );
        }
      }
    ]
  ];

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
          action={<CancelButton action={handleClose} title="button.close" />}
          avatar={
            <StatusIcon
              ariaTitle={t('sensitivityCalculatorResults.status', {
                status: level ? t('statusValue.' + level) : '',
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
