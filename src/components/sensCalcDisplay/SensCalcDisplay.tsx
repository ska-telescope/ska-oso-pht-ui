import React from 'react';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import getSensitivityCalculatorAPIData from '../../services/axios/sensitivityCalculator/getSensitivityCalculatorAPIData';
import { STATUS_ERROR, STATUS_INITIAL, STATUS_OK, STATUS_PARTIAL } from '../../utils/constants';
import { Box, Grid, IconButton } from '@mui/material';
import ObservationTargetResultsDisplay from '../alerts/observationTargetResultsDisplay/observationTargetResultsDisplay';
import Observation from '../../utils/types/observation';
import calculateSensitivityCalculatorResults from '../../services/axios/sensitivityCalculator/calculateSensitivityCalculatorResults';
import { useTranslation } from 'react-i18next';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import Proposal from 'utils/types/proposal';
import TargetObservation from 'utils/types/targetObservation';

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

  // const { t } = useTranslation('pht');
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
        console.log(':::IN RESPONSE', response);
        setResponse(response);
        // calculate results
        setResults(calculateSensitivityCalculatorResults(response, observation));
        console.log(':::results', results);
      }
    };

    if (!selected) {
      setLvl(STATUS_INITIAL);
    } else {
      getSensCalc();
    }
  }, [selected]);

  React.useEffect(() => {
    console.log('CHECK AGAIN');
    console.log('results', results);
    if (results) {
      console.log(':::IN RESULTS', results);
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

      console.log('##### getProposal', getProposal());
    }
  }, [results]);

  const IconClicked = () => {
    setOpenDialog(true);
  };

  return (
    <>
      <IconButton aria-label="SensCalc Status" style={{ cursor: 'hand' }} onClick={IconClicked}>
        <StatusIcon ariaTitle="" testId="statusId" icon level={lvl} size={SIZE} />
      </IconButton>
      {/*
      <ObservationTargetResultsDisplay
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        data={response}
        lvl={lvl}
        observation={observation}
      />
      */}
    </>
  );
}
