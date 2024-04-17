import React from 'react';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import getSensCalc, {
  SENSCALC_EMPTY
} from '../../../services/axios/sensitivityCalculator/getSensitivityCalculatorAPIData';
import { Grid, IconButton, Typography } from '@mui/material';
import SensCalcModalSingle from '../../alerts/sensCalcModal/single/SensCalcModalSingle';
import Observation from '../../../utils/types/observation';
import Target from '../../../utils/types/target';

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
  const [results, setResults] = React.useState(SENSCALC_EMPTY);

  React.useEffect(() => {
    async function fetchResults() {
      const sensCalcResult = selected ? await getSensCalc(observation, target) : SENSCALC_EMPTY;
      setResults(sensCalcResult);
    }
    fetchResults();
  }, [selected]);

  const IconClicked = () => {
    setOpenDialog(true);
  };

  const TotalSensitivity = () => {
    if (results.section1) {
      return results.section1.find(item => item.field === 'continuumTotalSensitivity')?.value;
    }
  };

  const IntegrationTime = () => {
    if (results.section3) {
      return results.section3.find(item => item.field === 'continuumIntegrationTime')?.value;
    }
  };

  return (
    <>
      <Grid container direction="row" justifyContent="flex-start" alignItems="center">
        <Grid mr={10}>
          <IconButton aria-label="SensCalc Status" style={{ cursor: 'hand' }} onClick={IconClicked}>
            <StatusIcon ariaTitle="" testId="statusId" icon level={results.status} size={SIZE} />
          </IconButton>
        </Grid>
        <Grid mr={10}>
          <Typography>
            {TotalSensitivity()} {/*results?.section1?.[2]?.value*/}{' '}
            {/*results?.totalSensitivity?.value*/}
          </Typography>
        </Grid>
        <Grid>
          <Typography>
            {IntegrationTime()} {/*results?.integrationTime?.value*/}
          </Typography>
        </Grid>
      </Grid>
      <SensCalcModalSingle open={openDialog} onClose={() => setOpenDialog(false)} data={results} />
    </>
  );
}
