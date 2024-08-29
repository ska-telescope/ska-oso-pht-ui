import React from 'react';
import { Box, Card, CardContent, CardHeader, Dialog, Stack, Typography } from '@mui/material';
import CancelButton from '../../../button/Cancel/Cancel';
import { Alert, AlertColorTypes, DataGrid } from '@ska-telescope/ska-gui-components';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { useTranslation } from 'react-i18next';
import Observation from '../../../../utils/types/observation';
import { OBS_TYPES, SUPPLIED_TYPE_SENSITIVITY, TYPE_CONTINUUM } from '../../../../utils/constants';
import { presentUnits, presentValue } from '../../../../utils/present';

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

  const isContinuum = () => observation.type === TYPE_CONTINUUM;
  const isSensitivity = () => observation.supplied.type === SUPPLIED_TYPE_SENSITIVITY;

  const observationTypeLabel: string = OBS_TYPES[observation.type];
  const label1 = `${observationTypeLabel}SensitivityWeighted`;
  const label2 = `${observationTypeLabel}ConfusionNoise`;
  const label3 = `${observationTypeLabel}TotalSensitivity`;
  const label4 = `${observationTypeLabel}SynthBeamSize`;
  const label5 = isSensitivity()
    ? `${observationTypeLabel}IntegrationTime`
    : `${observationTypeLabel}SurfaceBrightnessSensitivity`;
  const label6 = 'spectralSensitivityWeighted';
  const label7 = 'spectralConfusionNoise';
  const label8 = 'spectralTotalSensitivity';
  const label9 = 'spectralSynthBeamSize';
  const label10 = isSensitivity()
    ? 'spectralIntegrationTime'
    : 'spectralSurfaceBrightnessSensitivity';

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

  const presentation = rec => (rec ? presentValue(rec.value) + ' ' + presentUnits(rec.units) : '');

  const colTitle = {
    field: 'title',
    flex: 3,
    AutoResizeColumnHeadersHeight: true,
    renderHeader: () => headerDisplay('targetName')
  };

  const colField1 = {
    field: 'field1',
    flex: 3,
    AutoResizeColumnHeadersHeight: true,
    renderHeader: () => headerDisplay(isSensitivity() ? label2 : label1),
    renderCell: (e: { row: { section1: { value: any }[] } }) =>
      presentation(e.row.section1 ? e.row.section1[0] : null)
  };

  const colField2 = {
    field: 'field2',
    flex: 2.5,
    AutoResizeColumnHeadersHeight: true,
    renderHeader: () => headerDisplay(isSensitivity() ? label3 : label2),
    renderCell: (e: { row: { section1: { value: any }[] } }) =>
      presentation(e.row.section1 ? e.row.section1[1] : null)
  };

  const colField3 = {
    field: 'field3',
    flex: 3,
    AutoResizeColumnHeadersHeight: true,
    renderHeader: () => headerDisplay(isSensitivity() ? label4 : label3),
    renderCell: (e: { row: { section1: { value: any }[] } }) =>
      presentation(e.row.section1 ? e.row.section1[2] : null)
  };

  const colField4 = {
    field: 'field4',
    flex: 3,
    AutoResizeColumnHeadersHeight: true,
    renderHeader: () => headerDisplay(label4),
    renderCell: (e: { row: { section1: { value: any }[] } }) =>
      presentation(e.row.section1 ? e.row.section1[3] : null)
  };

  const colField5 = {
    field: 'field5',
    flex: 4,
    AutoResizeColumnHeadersHeight: true,
    renderHeader: () => headerDisplay(label5),
    renderCell: (e: { row: { section1: { value: any }[] } }) =>
      presentation(e.row.section1 ? e.row.section1[4] : null)
  };

  const colField6 = {
    field: 'field6',
    flex: 3,
    AutoResizeColumnHeadersHeight: true,
    renderHeader: () => headerDisplay(isSensitivity() ? label7 : label6),
    renderCell: (e: { row: { section2: { value: any }[] } }) =>
      presentation(e.row.section2 ? e.row.section2[0] : null)
  };

  const colField7 = {
    field: 'field7',
    flex: 2.5,
    AutoResizeColumnHeadersHeight: true,
    renderHeader: () => headerDisplay(isSensitivity() ? label8 : label7),
    renderCell: (e: { row: { section2: { value: any }[] } }) =>
      presentation(e.row.section2 ? e.row.section2[1] : null),
    optional: params => params.value !== null
  };

  const colField8 = {
    field: 'field8',
    flex: 3,
    AutoResizeColumnHeadersHeight: true,
    renderHeader: () => headerDisplay(isSensitivity() ? label9 : label8),
    renderCell: (e: { row: { section2: { value: any }[] } }) =>
      presentation(e.row.section2 ? e.row.section2[2] : null),
    optional: params => params.value !== null
  };

  const colField9 = {
    field: 'field9',
    flex: 3,
    AutoResizeColumnHeadersHeight: true,
    renderHeader: () => headerDisplay(label9),
    renderCell: (e: { row: { section2: { value: any }[] } }) =>
      presentation(e.row.section2 ? e.row.section2[3] : null),
    optional: params => params.value !== null
  };

  const colField10 = {
    field: 'field10',
    flex: 4,
    AutoResizeColumnHeadersHeight: true,
    renderHeader: () => headerDisplay(label10),
    renderCell: (e: { row: { section2: { value: any }[] } }) =>
      presentation(e.row.section2 ? e.row.section2[4] : null),
    optional: params => params.value !== null
  };

  const colField11 = {
    field: 'field11',
    flex: 3,
    AutoResizeColumnHeadersHeight: true,
    renderHeader: () => headerDisplay(isSensitivity() ? 'sensitivity' : 'integrationTime'),
    renderCell: (e: { row: { section3: { value: any }[] } }) =>
      presentation(e.row.section3 ? e.row.section3[0] : null),
    optional: params => params.value !== null
  };

  const colStatus = {
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
  };

  const getColumns = (data: { section2: any }[]) => {
    const results = [];
    results.push(colTitle);
    results.push(colField1);
    results.push(colField2);
    results.push(colField3);
    if (!isSensitivity()) {
      results.push(colField4);
      results.push(colField5);
    }
    if (isContinuum()) {
      results.push(colField6);
      results.push(colField7);
      results.push(colField8);
      if (!isSensitivity()) {
        results.push(colField9);
        results.push(colField10);
      }
    }
    results.push(colField11);
    results.push(colStatus);
    return [...results];
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
