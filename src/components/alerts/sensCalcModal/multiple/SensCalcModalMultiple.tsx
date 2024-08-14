import React from 'react';
import { Box, Card, CardContent, CardHeader, Dialog, Stack, Typography } from '@mui/material';
import CancelButton from '../../../button/Cancel/Cancel';
import { Alert, AlertColorTypes, DataGrid } from '@ska-telescope/ska-gui-components';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { useTranslation } from 'react-i18next';
import Observation from '../../../../utils/types/observation';
import { OBS_TYPES } from '../../../../utils/constants';
import { presentUnits } from '../../../../utils/helpers';

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

  const headerDisplay = (inStr: string) => {
    const sent = t(`sensitivityCalculatorResults.${inStr}`);
    const arr = sent.split(' ');
    return (
      <Stack>
        {arr.map(rec => {
          return HeaderLine(rec);
        })}
      </Stack>
    );
  };

  const presentation = rec => (rec ? rec.value + ' ' + presentUnits(rec.units) : '');

  const section1Columns = [
    {
      field: 'title',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay('targetName')
    },
    {
      field: 'field1',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay(label1),
      renderCell: (e: { row: { section1: { value: any }[] } }) =>
        presentation(e.row.section1 ? e.row.section1[0] : null)
    },
    {
      field: 'field2',
      flex: 2.5,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay(label2),
      renderCell: (e: { row: { section1: { value: any }[] } }) =>
        presentation(e.row.section1 ? e.row.section1[1] : null)
    },
    {
      field: 'field3',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay(label3),
      renderCell: (e: { row: { section1: { value: any }[] } }) =>
        presentation(e.row.section1 ? e.row.section1[2] : null)
    },
    {
      field: 'field4',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay(label4),
      renderCell: (e: { row: { section1: { value: any }[] } }) =>
        presentation(e.row.section1 ? e.row.section1[3] : null)
    },
    {
      field: 'field5',
      flex: 4,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay(label5),
      renderCell: (e: { row: { section1: { value: any }[] } }) =>
        presentation(e.row.section1 ? e.row.section1[4] : null)
    }
  ];

  const section2Columns = [
    {
      field: 'field6',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay('spectralSensitivityWeighted'),
      renderCell: (e: { row: { section2: { value: any }[] } }) =>
        presentation(e.row.section2 ? e.row.section2[0] : null)
    },
    {
      field: 'field7',
      flex: 2.5,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay('spectralConfusionNoise'),
      renderCell: (e: { row: { section2: { value: any }[] } }) =>
        presentation(e.row.section2 ? e.row.section2[1] : null),
      optional: params => params.value !== null
    },
    {
      field: 'field8',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay('spectralTotalSensitivity'),
      renderCell: (e: { row: { section2: { value: any }[] } }) =>
        presentation(e.row.section2 ? e.row.section2[2] : null),
      optional: params => params.value !== null
    },
    {
      field: 'field9',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay('spectralSynthBeamSize'),
      renderCell: (e: { row: { section2: { value: any }[] } }) =>
        presentation(e.row.section2 ? e.row.section2[3] : null),
      optional: params => params.value !== null
    },
    {
      field: 'field10',
      flex: 4,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay('spectralSurfaceBrightnessSensitivity'),
      renderCell: (e: { row: { section2: { value: any }[] } }) =>
        presentation(e.row.section2 ? e.row.section2[4] : null),
      optional: params => params.value !== null
    }
  ];

  const section3Columns = [
    {
      field: 'field11',
      flex: 3,
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay('integrationTime'),
      renderCell: (e: { row: { section3: { value: any }[] } }) =>
        presentation(e.row.section3 ? e.row.section3[0] : null),
      optional: params => params.value !== null
    }
  ];

  const statusColumn = [
    {
      field: 'statusGUI',
      headerName: '',
      sortable: false,
      width: 50,
      disableClickEventBubbling: true,
      renderCell: (e: { row: { statusGUI: number; error: string } }) => {
        return (
          <Box pt={1}>
            <StatusIcon
              ariaTitle={t('sensitivityCalculatorResults.status', {
                status: t('statusValue.' + e.row.statusGUI),
                error: e.row.error
              })}
              testId="statusId"
              icon
              level={e.row.statusGUI}
              size={SIZE}
            />
          </Box>
        );
      }
    }
  ];

  const getColumns = data => {
    const results1 = data[0]?.section2
      ? [...section1Columns, ...section2Columns]
      : [...section1Columns];
    const results2 = [...results1, ...section3Columns, ...statusColumn];
    return [...results2];
  };

  return (
    <Dialog
      PaperProps={{
        style: {
          minWidth: '95%',
          maxWidth: '95%'
        }
      }}
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
              columns={getColumns(data)}
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
