import React from 'react';
import { t } from 'i18next';
import { Grid, IconButton, Typography } from '@mui/material';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import getSensCalc from '../../../services/axios/sensitivityCalculator/getSensitivityCalculatorAPIData';
import {
  SENSCALC_EMPTY_MOCKED,
  SENSCALC_PARTIAL_MOCKED
} from '../../../services/axios/sensitivityCalculator/SensCalcResultsMOCK';
import SensCalcModalSingle from '../../alerts/sensCalcModal/single/SensCalcModalSingle';
import Observation from '../../../utils/types/observation';
import Target from '../../../utils/types/target';
import { OBS_TYPES, STATUS_OK } from '../../../utils/constants';

const SIZE = 20;

interface SensCalcDisplaySingleProps {
  selected: boolean;
  row: any;
  observation: Observation;
  setObs: Function;
  target: Target;
}

export default function SensCalcDisplaySingle({
  selected,
  row,
  observation,
  setObs,
  target
}: SensCalcDisplaySingleProps) {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [results, setResults] = React.useState(SENSCALC_EMPTY_MOCKED);
  const observationTypeLabel: string = OBS_TYPES[observation?.type];
  const [toolTipError, setTooltipError] = React.useState('');
  const [fetch, setFetch] = React.useState(false);

  React.useEffect(() => {
    const updateResults = (result: any) => {
      displayToolTipMessage(result);
      setResults(result);
      console.log('TREVOR, UNSETTING THE FETCH');
      setFetch(false);
    };

    async function fetchResults() {
      const tmp = SENSCALC_PARTIAL_MOCKED;
      tmp.error = t('sensitivityCalculatorResults.partial');
      setResults(tmp);
      setTooltipError(t('sensitivityCalculatorResults.partial'));
      const sensCalcResult = selected
        ? await getSensCalc(observation, target)
        : SENSCALC_EMPTY_MOCKED;
      updateResults(sensCalcResult);
      setObs(observation.id, target, sensCalcResult);
    }

    if (fetch) {
      if (observation) {
        console.log('TREVOR GETS HERE');
        fetchResults();
      } else {
        updateResults(row.status);
      }
    }
  }, [fetch]);

  React.useEffect(() => {
    if (selected && !fetch) {
      console.log('TREVOR, SETTING THE FETCH');
      setFetch(true);
    }
  }, [selected]);

  const IconClicked = () => {
    setOpenDialog(true);
  };

  const displayToolTipMessage = response => {
    setTooltipError('');
    if (response.status === 1) {
      if (response?.error) {
        setTooltipError(response.error);
      } else if (response?.weighting?.error?.title) {
        setTooltipError(
          `${response?.weighting?.error?.title}\n${response?.weighting?.error?.detail}`
        );
      } else if (response?.calculate?.error.title) {
        setTooltipError(
          `${response?.calculate?.error?.title}\n${response?.calculate?.error?.detail}`
        );
      } else {
        setTooltipError(t('sensitivityCalculatorResults.errorUnknown'));
      }
    }
  };

  const TotalSensitivity: any = type => {
    if (results.section1) {
      const result = results.section1.find(
        item => item.field === `${observationTypeLabel}TotalSensitivity`
      );
      return result[type];
    }
    return '';
  };

  const IntegrationTime: any = type => {
    if (results.section3) {
      const result = results.section3.find(item => item.field === 'integrationTime');
      return result[type];
    }
    return '';
  };

  return (
    <>
      <Grid container direction="row" justifyContent="flex-start" alignItems="center">
        <Grid item xs={2}>
          <IconButton
            style={{ cursor: 'hand' }}
            onClick={results.status === STATUS_OK ? IconClicked : null}
          >
            <StatusIcon
              ariaTitle={t('sensitivityCalculatorResults.status', {
                status: t('statusValue.' + results.status),
                error: toolTipError
              })}
              testId="statusId"
              icon
              level={results.status}
              size={SIZE}
            />
          </IconButton>
        </Grid>
        {toolTipError?.length === 0 && (
          <Grid item xs={5}>
            <Typography>{`${TotalSensitivity('value')} ${TotalSensitivity('units')}`}</Typography>
          </Grid>
        )}
        {toolTipError?.length === 0 && (
          <Grid item xs={5}>
            <Typography>{`${IntegrationTime('value')} ${IntegrationTime('units')}`}</Typography>
          </Grid>
        )}
        {toolTipError?.length > 0 && (
          <Grid item xs={10}>
            <Typography>{toolTipError}</Typography>
          </Grid>
        )}
      </Grid>
      <SensCalcModalSingle open={openDialog} onClose={() => setOpenDialog(false)} data={results} />
    </>
  );
}
