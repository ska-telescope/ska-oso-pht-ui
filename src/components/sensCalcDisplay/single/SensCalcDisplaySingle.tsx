import React from 'react';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import getSensCalc from '../../../services/axios/sensitivityCalculator/getSensitivityCalculatorAPIData';
import { SENSCALC_EMPTY_MOCKED } from '../../../services/axios/sensitivityCalculator/SensCalcResultsMOCK';
import { Grid, IconButton, Typography, Tooltip } from '@mui/material';
import SensCalcModalSingle from '../../alerts/sensCalcModal/single/SensCalcModalSingle';
import Observation from '../../../utils/types/observation';
import Target from '../../../utils/types/target';
import { OBS_TYPES } from '../../../utils/constants';

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
    if (response.status === 1) {
      let text: string = '';
      if (response?.weighting?.error) {
        text = `${response?.weighting?.error?.title}\n${response?.weighting?.error?.detail}`;
      } else if (response?.calculate?.error) {
        text += `${response?.calculate?.error?.title}\n${response?.calculate?.error?.detail}`;
      }
      setTooltipError(text);
    } else {
      setTooltipError(null);
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
        <Grid mr={10}>
          <Tooltip title={toolTipError} id="SensCalTooltip">
            <IconButton
              aria-label="SensCalc Status"
              style={{ cursor: 'hand' }}
              onClick={IconClicked}
            >
              <StatusIcon ariaTitle="" testId="statusId" icon level={results.status} size={SIZE} />
            </IconButton>
          </Tooltip>
        </Grid>
        <Grid mr={10}>
          <Typography>{`${TotalSensitivity('value')} ${TotalSensitivity('units')}`}</Typography>
        </Grid>
        <Grid>
          <Typography>{`${IntegrationTime('value')} ${IntegrationTime('units')}`}</Typography>
        </Grid>
      </Grid>
      <SensCalcModalSingle open={openDialog} onClose={() => setOpenDialog(false)} data={results} />
    </>
  );
}
