import React from 'react';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import getSensitivityCalculatorAPIData from '../../services/axios/sensitivityCalculator/getSensitivityCalculatorAPIData';
import { STATUS_ERROR, STATUS_INITIAL, STATUS_OK, STATUS_PARTIAL } from '../../utils/constants';
import { Box, Grid, IconButton } from '@mui/material';
import ObservationTargetResultsDisplay from '../alerts/observationTargetResultsDisplay/observationTargetResultsDisplay';
import Observation from '../../utils/types/observation';
import calculateSensitivityCalculatorResults from '../../services/axios/sensitivityCalculator/calculateSensitivityCalculatorResults';
import { useTranslation } from 'react-i18next';

const SIZE = 20;

interface SensCalcDisplayProps {
  selected: boolean;
  observation: Observation;
}

export default function SensCalcDisplay({ selected, observation }: SensCalcDisplayProps) {
  const { t } = useTranslation('pht');
  const [lvl, setLvl] = React.useState(STATUS_PARTIAL);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [response, setResponse] = React.useState(null);
  const [results, setResults] = React.useState(null);

  React.useEffect(() => {
    const getSensCalc = async () => {
      const response = await getSensitivityCalculatorAPIData(observation);
      // Calculate response for LOW doesn't have a status property: this will cause the error icon to be wrongly displayed for LOW responses
      // TODO: handle response errors differently
      setLvl(response?.calculate?.status ? STATUS_OK : STATUS_ERROR);
      // calculate results
      const results = calculateSensitivityCalculatorResults(response, observation);
      console.log(':::results', results);
      setResponse(response);
      setResults(results);
    };

    if (!selected) {
      setLvl(STATUS_INITIAL);
    } else {
      getSensCalc();
    }
  }, [selected]);

  const IconClicked = () => {
    setOpenDialog(true);
  };

  return (
    <>
      <Grid container direction="column" xs={2}>
        <Grid item container justifyContent="center">
          <IconButton aria-label="SensCalc Status" style={{ cursor: 'hand' }} onClick={IconClicked}>
            <StatusIcon ariaTitle="" testId="statusId" icon level={lvl} size={SIZE} />
          </IconButton>
        </Grid>
      </Grid>
      <Grid container direction="column" xs={10}>
        <Grid container direction="row" xs={10} spacing={2} justifyContent="space-around">
          <Grid item xs={5}>
            {results ? t('sensitivityCalculatorResults.totalSensitivity') : ''}
          </Grid>
          <Grid item xs={5}>
            {results?.totalSensitivity?.value}
          </Grid>
        </Grid>
        <Grid container direction="row" xs={10} spacing={2} justifyContent="space-around">
          <Grid item xs={5}>
            {results ? t('sensitivityCalculatorResults.integrationTime') : ''}
          </Grid>
          <Grid item xs={5}>
            {results?.integrationTime?.value}
          </Grid>
        </Grid>
      </Grid>
      <ObservationTargetResultsDisplay
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        data={response}
        lvl={lvl}
        observation={observation}
      />
    </>
  );
}
