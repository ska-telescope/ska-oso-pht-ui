import React from 'react';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
// import getSensCalc from '../../services/axios/sensitivityCalculator/getSensitivityCalculatorAPIData';
import { IconButton } from '@mui/material';
import { SENSCALC_EMPTY_MOCKED } from '../../services/axios/sensitivityCalculator/SensCalcResultsMOCK';
import SensCalcModalSingle from '../alerts/sensCalcModal/single/SensCalcModalSingle';
import Observation from '../../utils/types/observation';
import Target from '../../utils/types/target';

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
  const [results] = React.useState(SENSCALC_EMPTY_MOCKED);

  // React.useEffect(
  //  () => setResults(selected ? getSensCalc(observation, target) : SENSCALC_EMPTY_MOCKED),
  //  [selected]
  // );

  const IconClicked = () => {
    setOpenDialog(true);
  };

  return (
    <>
      <IconButton aria-label="SensCalc Status" style={{ cursor: 'hand' }} onClick={IconClicked}>
        <StatusIcon ariaTitle="" testId="statusId" icon level={results.status} size={SIZE} />
      </IconButton>
      <SensCalcModalSingle open={openDialog} onClose={() => setOpenDialog(false)} data={results} />
    </>
  );
}
