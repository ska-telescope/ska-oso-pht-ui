import { Box, Card, CardContent, CardHeader, Dialog, Stack, Typography } from '@mui/material';
import { Alert, AlertColorTypes, DataGrid } from '@ska-telescope/ska-gui-components';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { presentSensCalcError, presentUnits, presentValue } from '@utils/present/present';
import {
  CUSTOM_VALID_FIELDS,
  SUPPLIED_TYPE_SENSITIVITY,
  TYPE_CONTINUUM
} from '@utils/constants.ts';
import CancelButton from '../../../button/Cancel/Cancel';
import Observation from '../../../../utils/types/observation';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

export type Rec = { field: string; value: string; units: string };
interface SensCalcModalMultipleProps {
  open: boolean;
  onClose: Function;
  data: any;
  observation: Observation;
  level: number;
  levelError: string;
  isCustom: boolean;
  isNatural: boolean;
}

const SIZE = 20;

export default function SensCalcModalMultiple({
  open,
  onClose,
  data,
  observation,
  level,
  levelError,
  isCustom,
  isNatural
}: SensCalcModalMultipleProps) {
  const handleClose = () => {
    onClose();
  };

  const { t } = useScopedTranslation();

  const isContinuum = () => observation.type === TYPE_CONTINUUM;
  const isSensitivity = () => observation.supplied.type === SUPPLIED_TYPE_SENSITIVITY;

  const PresentCustomResultValue = (rec: Rec) => {
    if (rec.field === 'targetName') {
      return rec.value;
    }
    if (!CUSTOM_VALID_FIELDS.includes(rec.field)) {
      if (isNatural) {
        return t('sensitivityCalculatorResults.nonGaussian');
      }
      return t('sensitivityCalculatorResults.customArray');
    }
    return `${presentValue(rec.value)} ${presentUnits(rec.units)}`;
  };

  let i = 0; // Just here so that the key warning is dealt with
  let headerNumber = 0;

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

  const presentation = (rec: Rec | null) => {
    if (rec) {
      return isCustom || isNatural
        ? PresentCustomResultValue(rec) + ' '
        : presentValue(rec.value) + ' ' + presentUnits(rec.units);
    } else {
      return '';
    }
  };

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
    renderHeader: () => headerDisplay(data[headerNumber].section1[0]?.field),
    renderCell: (e: { row: { section1: Rec[] } }) => (
      <div data-testid="field1">{presentation(e?.row?.section1 ? e.row.section1[0] : null)}</div>
    )
  };

  const colField2 = {
    field: 'field2',
    flex: 2.5,
    AutoResizeColumnHeadersHeight: true,
    renderHeader: () => headerDisplay(data[headerNumber].section1[1]?.field),
    renderCell: (e: { row: { section1: Rec[] } }) => (
      <div data-testid="field2">{presentation(e?.row?.section1 ? e.row.section1[1] : null)}</div>
    )
  };

  const colField3 = {
    field: 'field3',
    flex: 3,
    AutoResizeColumnHeadersHeight: true,
    renderHeader: () => headerDisplay(data[headerNumber].section1[2]?.field),
    renderCell: (e: { row: { section1: Rec[] } }) => (
      <div data-testid="field3">{presentation(e?.row?.section1 ? e.row.section1[2] : null)}</div>
    )
  };

  const colField4 = {
    field: 'field4',
    flex: 3,
    AutoResizeColumnHeadersHeight: true,
    renderHeader: () => headerDisplay(data[headerNumber].section1[3]?.field),
    renderCell: (e: { row: { section1: Rec[] } }) => (
      <div data-testid="field4">{presentation(e?.row?.section1 ? e.row.section1[3] : null)}</div>
    )
  };

  const colField5 = {
    field: 'field5',
    flex: 4,
    AutoResizeColumnHeadersHeight: true,
    renderHeader: () => headerDisplay(data[headerNumber].section1[4]?.field),
    renderCell: (e: { row: { section1: Rec[] } }) => (
      <div data-testid="field5">{presentation(e?.row?.section1 ? e.row.section1[4] : null)}</div>
    )
  };

  const colField6 = {
    field: 'field6',
    flex: 3,
    AutoResizeColumnHeadersHeight: true,
    renderHeader: () => headerDisplay(data[headerNumber].section2[0]?.field),
    renderCell: (e: { row: { section2: Rec[] } }) => (
      <div data-testid="field6">{presentation(e?.row?.section2 ? e.row.section2[0] : null)}</div>
    )
  };

  const colField7 = {
    field: 'field7',
    flex: 2.5,
    AutoResizeColumnHeadersHeight: true,
    renderHeader: () => headerDisplay(data[headerNumber].section2[1]?.field),
    renderCell: (e: { row: { section2: Rec[] } }) => (
      <div data-testid="field7">{presentation(e?.row?.section2 ? e.row.section2[1] : null)}</div>
    ),
    optional: (params: { value: null }) => params.value !== null
  };

  const colField8 = {
    field: 'field8',
    flex: 3,
    AutoResizeColumnHeadersHeight: true,
    renderHeader: () => headerDisplay(data[headerNumber].section2[2]?.field),
    renderCell: (e: { row: { section2: Rec[] } }) => (
      <div data-testid="field8">{presentation(e?.row?.section2 ? e.row.section2[2] : null)}</div>
    ),
    optional: (params: { value: null }) => params.value !== null
  };

  const colField9 = {
    field: 'field9',
    flex: 3,
    AutoResizeColumnHeadersHeight: true,
    renderHeader: () => headerDisplay(data[headerNumber].section2[3]?.field),
    renderCell: (e: { row: { section2: Rec[] } }) => (
      <div data-testid="field9">{presentation(e?.row?.section2 ? e.row.section2[3] : null)}</div>
    ),
    optional: (params: { value: null }) => params.value !== null
  };

  const colField10 = {
    field: 'field10',
    flex: 4,
    AutoResizeColumnHeadersHeight: true,
    renderHeader: () => headerDisplay(data[headerNumber].section2[4]?.field),
    renderCell: (e: { row: { section2: Rec[] } }) => (
      <div data-testid="field10">{presentation(e?.row?.section2 ? e.row.section2[4] : null)}</div>
    ),
    optional: (params: { value: null }) => params.value !== null
  };

  const colField11 = {
    field: 'field11',
    flex: 3,
    AutoResizeColumnHeadersHeight: true,
    renderHeader: () => headerDisplay(data[headerNumber].section3[0]?.field),
    renderCell: (e: { row: { section3: Rec[] } }) => (
      <div data-testid="field11">{presentation(e?.row?.section3 ? e.row.section3[0] : null)}</div>
    ),
    optional: (params: { value: null }) => params.value !== null
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
              error: e.row.error ? t(presentSensCalcError(e.row.error)) : ''
            })}
            testId="statusId"
            icon
            level={e?.row?.statusGUI}
            size={SIZE}
          />
        </Box>
      );
    }
  };

  const setHeaderNumber = () => {
    headerNumber = -1;
    for (i = 0; i < data.length; i++) {
      if (data[i]?.section1) {
        headerNumber = i;
        return;
      }
    }
  };

  const getColumns = () => {
    setHeaderNumber();
    const results = [];
    results.push(colTitle);
    if (headerNumber !== -1) {
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
    }
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
          action={<CancelButton action={handleClose} title="closeBtn.label" />}
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
          slotProps={{
            title: {
              align: 'center',
              fontWeight: 'bold',
              variant: 'h5'
            }
          }}
        />
        <CardContent>
          {data ? (
            <DataGrid
              rows={data}
              columns={getColumns()}
              columnHeaderHeight={100}
              height={500}
              testId="sensCalcDetailsList"
              // getRowId={(row: { field: any; value: any; }) => `${row.field}-${row.value}`}
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
