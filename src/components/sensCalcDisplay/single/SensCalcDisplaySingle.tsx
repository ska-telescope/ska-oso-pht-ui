import React from 'react';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import getSensCalc from '../../../services/axios/sensitivityCalculator/getSensitivityCalculatorAPIData';
import { SENSCALC_EMPTY_MOCKED } from '../../../services/axios/sensitivityCalculator/SensCalcResultsMOCK';
import { Grid, IconButton, Typography } from '@mui/material';
import SensCalcModalSingle from '../../alerts/sensCalcModal/single/SensCalcModalSingle';
import Observation from '../../../utils/types/observation';
import Target from '../../../utils/types/target';
import { OBS_TYPES } from '../../../utils/constants';
import { t } from 'i18next';

const SIZE = 20;

interface SensCalcDisplaySingleProps {
  selected: boolean;
  observation: Observation;
  target: Target;
}

export default function SensCalcDisplaySingle({
  selected,
  observation,
  target
}: SensCalcDisplaySingleProps) {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [results, setResults] = React.useState(SENSCALC_EMPTY_MOCKED);
  const observationTypeLabel: string = OBS_TYPES[observation.type];
  const [toolTipError, setTooltipError] = React.useState('');

  React.useEffect(() => {
    async function fetchResults() {
      const sensCalcResult = selected
        ? await getSensCalc(observation, target)
        : SENSCALC_EMPTY_MOCKED;
      displayToolTipMessage(sensCalcResult);
      setResults(sensCalcResult);
    }
    fetchResults();
  }, [selected]);

  const IconClicked = () => {
    setOpenDialog(true);
  };

  const displayToolTipMessage = response => {
    setTooltipError('');
    if (response.status === 1) {
      if (response?.weighting?.error?.title) {
        setTooltipError(`${response?.weighting?.error?.title}\n${response?.weighting?.error?.detail}`);
      } else if (response?.calculate?.error.title) {
        setTooltipError(`${response?.calculate?.error?.title}\n${response?.calculate?.error?.detail}`);
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
          <IconButton style={{ cursor: 'hand' }} onClick={IconClicked}>
            <StatusIcon
              ariaTitle={t('sensitivityCalculatorResults.status', {
                status: t('statusValue.' + results.status)
              })}
              testId="statusId"
              icon
              level={results.status}
              size={SIZE}
            />
          </IconButton>
        </Grid>
        {toolTipError?.length === 0 && <Grid item xs={5}>
            <Typography>{`${TotalSensitivity('value')} ${TotalSensitivity('units')}`}</Typography>
          </Grid>
        }
        {toolTipError?.length === 0 && <Grid item xs={5}>
            <Typography>{`${IntegrationTime('value')} ${IntegrationTime('units')}`}</Typography>
          </Grid>
        }
        {toolTipError?.length > 0 && <Grid item xs={10}>
            <Typography>{toolTipError}</Typography>
          </Grid>
        }
      </Grid>
      <SensCalcModalSingle open={openDialog} onClose={() => setOpenDialog(false)} data={results} />
    </>
  );
}
