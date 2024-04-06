import React from 'react';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import getSensitivityCalculatorAPIData from '../../services/axios/sensitivityCalculator/getSensitivityCalculatorAPIData';
import { STATUS_ERROR, STATUS_INITIAL, STATUS_OK, STATUS_PARTIAL } from '../../utils/constants';
import { Box, Grid, IconButton, Typography } from '@mui/material';
import ObservationTargetResultsDisplay from '../alerts/observationTargetResultsDisplay/observationTargetResultsDisplay';
import Observation from '../../utils/types/observation';
import calculateSensitivityCalculatorResults from '../../services/axios/sensitivityCalculator/calculateSensitivityCalculatorResults';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import Proposal from 'utils/types/proposal';
// import TargetObservation from 'utils/types/targetObservation';

const SIZE = 20;

interface SensCalcDisplayProps {
  selected: boolean;
  observation: Observation;
  targetId?: number;
}

export default function SensCalcDisplay({ selected, observation, targetId }: SensCalcDisplayProps) {
  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();
  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

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
      if (response) {
        setResponse(response);
        // TODO Trying to add Sens Cal to the Redux store below causes multiple API calls?
        // setResults(calculateSensitivityCalculatorResults(response, observation)); // to save results in redux store
        const results = calculateSensitivityCalculatorResults(response, observation);
        if (results) {
          setResults(results);
        }
      }
    };

    if (!selected) {
      setLvl(STATUS_INITIAL);
    } else {
      if (!results) {
        getSensCalc();
      }
    }
  }, [selected]);

  /*
  // Add Sens Cal results in redux stored proposal
  React.useEffect(() => {
    if (results) {
      const updatedTargetObservation = getProposal().targetObservation.map(targetObservation => {
        if (
          targetObservation.observationId === observation.id &&
          targetObservation.targetId === targetId
        ) {
          return {
            ...targetObservation,
            sensitivityCalculatorResults: results
          };
        }
        return targetObservation;
      });

      setProposal({
        ...getProposal(),
        targetObservation: updatedTargetObservation
      });
    }
  }, [results]);
  */

  const IconClicked = () => {
    setOpenDialog(true);
  };

  // removed from return below as was causing icons to be displayed twice
  // TODO investigate issue to place modal below
  <ObservationTargetResultsDisplay
    open={openDialog}
    onClose={() => setOpenDialog(false)}
    data={response}
    lvl={lvl}
    observation={observation}
  />;

  return (
    <>
      <Grid container direction="row" justifyContent="flex-start" alignItems="center">
        <Grid mr={10}>
          <IconButton aria-label="SensCalc Status" style={{ cursor: 'hand' }} onClick={IconClicked}>
            <StatusIcon ariaTitle="" testId="statusId" icon level={lvl} size={SIZE} />
          </IconButton>
        </Grid>
        <Grid mr={10}>
          <Typography>{results?.totalSensitivity?.value}</Typography>
        </Grid>
        <Grid>
          <Typography>{results?.integrationTime?.value}</Typography>
        </Grid>
      </Grid>
    </>
  );
}
