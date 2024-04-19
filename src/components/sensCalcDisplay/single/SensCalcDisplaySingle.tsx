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

  const TotalSensitivity: any = type => {
    if (results.section1) {
      const result = results.section1.find(item => item.field === 'continuumTotalSensitivity');
      return result[type];
    }
    return '';
  };

  const IntegrationTime: any = type => {
    if (results.section4) {
      const result = results.section4.find(item => item.field === 'integrationTime');
      return result[type];
    }
    return '';
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
