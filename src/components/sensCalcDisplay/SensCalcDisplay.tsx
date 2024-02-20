import React from 'react';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import getSensitivityCalculatorAPIData from '../../services/axios/sensitivityCalculator/getSensitivityCalculatorAPIData';
import { STATUS_ERROR, STATUS_INITIAL, STATUS_OK, STATUS_PARTIAL } from '../../utils/constants';
import { IconButton } from '@mui/material';
import ObservationTargetResultsDisplay from '../alerts/observationTargetResultsDisplay/observationTargetResultsDisplay';

const SIZE = 20;

interface SensCalcDisplayProps {
  selected: boolean;
  observation: { telescope: number; subarray: number };
}

// TODO : Need to add a modal
// TODO : pass querry parameters from observation instead of mock query parameters in service

export default function SensCalcDisplay({ selected, observation }: SensCalcDisplayProps) {
  const [lvl, setLvl] = React.useState(STATUS_PARTIAL);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [response, setResponse] = React.useState(null);

  React.useEffect(() => {
    const getSensCalc = async () => {
      const response = await getSensitivityCalculatorAPIData(
        observation.telescope,
        observation.subarray
      );
      setLvl(response?.calculate?.status ? STATUS_OK : STATUS_ERROR);
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
