import React from 'react';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import getSensitivityCalculatorAPIData from '../../services/axios/sensitivityCalculator/getSensitivityCalculatorAPIData';
import { STATUS_ERROR, STATUS_INITIAL, STATUS_OK, STATUS_PARTIAL } from '../../utils/constants';
import { IconButton } from '@mui/material';
import ObservationTargetResultsDisplay from '../alerts/observationTargetResultsDisplay/observationTargetResultsDisplay';
import Observation from '../../utils/types/observation';
import calculateSensitivityCalculatorResults from '../../services/axios/sensitivityCalculator/calculateSensitivityCalculatorResults';

const SIZE = 20;

interface SensCalcDisplayProps {
  selected: boolean;
  observation: Observation;
}

export default function SensCalcDisplay({ selected, observation }: SensCalcDisplayProps) {
  const [lvl, setLvl] = React.useState(STATUS_PARTIAL);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [response, setResponse] = React.useState(null);

  React.useEffect(() => {
    const getSensCalc = async () => {
      const response = await getSensitivityCalculatorAPIData(observation);
      // Calculate response for LOW doesn't have a status property: this will cause the error icon to be wrongly displayed for LOW responses
      // TODO: handle response errors differently
      setLvl(response?.calculate?.status ? STATUS_OK : STATUS_ERROR);
      // calculate results
      const results = calculateSensitivityCalculatorResults(response, observation);
      setResponse(response);
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
      <IconButton aria-label="SensCalc Status" style={{ cursor: 'hand' }} onClick={IconClicked}>
        <StatusIcon ariaTitle="" testId="statusId" icon level={lvl} size={SIZE} />
      </IconButton>
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
