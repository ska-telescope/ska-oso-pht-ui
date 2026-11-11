import { Box, Card, CardContent, CardHeader, Dialog, Stack, Typography } from '@mui/material';
import { Alert, AlertColorTypes, DataGrid } from '@ska-telescope/ska-gui-components';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { presentUnits, presentValue } from '@utils/present/present';
import {
  SENSITIVITY_STATE,
  TIME_UNITS,
  TYPE_CONTINUUM,
  TYPE_PST
} from '@utils/constants.ts';
import { sensitivityStatusLevel } from '@utils/helpersSensCalc';
import { SENSITIVITY_FIELDS } from '@/services/sensitivityCalculator/results';
import type { Sensitivity } from '@/models/proposals/targetObservation';
import CancelButton from '../../../button/Cancel/Cancel';
import Observation from '../../../../utils/types/observation';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

/** A row of the table: a link with results, named by its target. */
export type SensCalcRow = { id: string; title: string; sensitivity: Sensitivity };

type Shown = { value: string | number; unit: string };

interface SensCalcModalMultipleProps {
  open: boolean;
  onClose: Function;
  data: SensCalcRow[];
  observation: Observation;
  level: number;
  levelError: string;
  isCustom: boolean;
}

const SIZE = 20;

export default function SensCalcModalMultiple({
  open,
  onClose,
  data,
  observation,
  level,
  levelError,
  isCustom
}: SensCalcModalMultipleProps) {
  const handleClose = () => {
    onClose();
  };

  const { t } = useScopedTranslation();

  const isContinuum = () => observation.type === TYPE_CONTINUUM;
  const isPST = () => observation.type === TYPE_PST;

  // Shown for a result the calculator didn't give: the ones that depend on the synthesized beam,
  // which a custom subarray or a non-Gaussian beam has none of
  const notAvailable = t(
    isCustom
      ? 'sensitivityCalculatorResults.customArray'
      : 'sensitivityCalculatorResults.nonGaussian'
  );

  let i = 0; // Just here so that the key warning is dealt with

  function renderHeaderLine(str: string) {
    return <Typography key={i++}>{str}</Typography>;
  }

  const headerDisplay = (inStr: string) => {
    const sent = t(`sensitivityCalculatorResults.${inStr}`);
    const arr = sent.split(' ');
    return (
      <Stack>
        {arr.map((rec) => {
          return renderHeaderLine(rec);
        })}
      </Stack>
    );
  };

  const presentation = (shown: Shown) => presentValue(shown.value) + ' ' + presentUnits(shown.unit);

  const colTitle = {
    field: 'title',
    flex: 3,
    AutoResizeColumnHeadersHeight: true,
    renderHeader: () => headerDisplay('targetName')
  };

  // Each part's columns, labelled by the part, e.g. continuumSensitivityWeighted
  const FIELD_FLEX = [3, 2.5, 3, 3, 4];
  const resultColumns = (part: 'continuum' | 'spectral') =>
    SENSITIVITY_FIELDS.map(({ key, label }, index) => ({
      field: `${part}${label}`,
      flex: FIELD_FLEX[index],
      AutoResizeColumnHeadersHeight: true,
      renderHeader: () => headerDisplay(`${part}${label}`),
      renderCell: (e: { row: SensCalcRow }) => {
        const sensitivity = e.row.sensitivity;
        const values = sensitivity.state === SENSITIVITY_STATE.DONE ? sensitivity[part] : undefined;
        const shown = values?.[key];
        return (
          <div data-testid={`field-${part}${label}`}>
            {values ? (shown ? presentation(shown) : notAvailable) : ''}
          </div>
        );
      }
    }));

  // The results were calculated for the observation's integration time
  const colIntegrationTime = {
    field: 'integrationTime',
    flex: 3,
    AutoResizeColumnHeadersHeight: true,
    renderHeader: () => headerDisplay('integrationTime'),
    renderCell: (e: { row: SensCalcRow }) => (
      <div data-testid="field-integrationTime">
        {e.row.sensitivity.state === SENSITIVITY_STATE.DONE &&
          presentation({
            value: observation.supplied.value,
            unit: TIME_UNITS.find((u) => u.id === observation.supplied.units)?.value ?? ''
          })}
      </div>
    )
  };

  const colStatus = {
    field: 'state',
    headerName: '',
    sortable: false,
    width: 50,
    disableClickEventBubbling: true,
    renderCell: (e: { row: SensCalcRow }) => {
      const sensitivity = e.row.sensitivity;
      const level = sensitivityStatusLevel(sensitivity.state);
      return (
        <Box
          sx={{
            pt: 1
          }}
        >
          <StatusIcon
            ariaTitle={t('sensitivityCalculatorResults.status', {
              status: t('statusValue.' + level),
              error: sensitivity.state === SENSITIVITY_STATE.FAILED ? sensitivity.error : ''
            })}
            testId="statusId"
            icon
            level={level}
            size={SIZE}
          />
        </Box>
      );
    }
  };

  const getColumns = () => {
    const done = data.flatMap((row) =>
      row.sensitivity.state === SENSITIVITY_STATE.DONE ? [row.sensitivity] : []
    );
    if (done.length === 0) {
      return [colTitle, colStatus];
    }
    // Zoom results are spectral only. Continuum results show their spectral part too for a
    // continuum observation, but not for the combined mode.
    const hasContinuum = done.some((sensitivity) => sensitivity.continuum);
    return [
      colTitle,
      ...(hasContinuum ? resultColumns('continuum') : []),
      ...(!hasContinuum || isContinuum() ? resultColumns('spectral') : []),
      colIntegrationTime,
      colStatus
    ];
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      id="alert-dialog-proposal-change"
      slotProps={{
        paper: {
          style: {
            minWidth: '95%',
            maxWidth: '95%'
          }
        }
      }}
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
          {!isPST() && data ? (
            <DataGrid
              rows={data}
              columns={getColumns()}
              columnHeaderHeight={100}
              height={500}
              testId="sensCalcDetailsList"
              // getRowId={(row: { field: any; value: any; }) => `${row.field}-${row.value}`}
            />
          ) : isPST() ? (
            <Alert testId="alertSensCalResultsId" color={AlertColorTypes.Error}>
              <Typography>{t('page.7.pstUnavailable')}</Typography>
            </Alert>
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
