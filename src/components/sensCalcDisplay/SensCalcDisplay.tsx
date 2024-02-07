import React from 'react';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import getSensitivityCalculatorAPIData from '../../services/axios/sensitivityCalculator/getSensitivityCalculatorAPIData';
import { STATUS_ERROR, STATUS_INITIAL, STATUS_OK, STATUS_PARTIAL } from '../../utils/constants';
import { IconButton } from '@mui/material';

const SIZE = 20;

interface SensCalcDisplayProps {
  selected: boolean;
  observation: { telescope: number; subarray: number };
}

// TODO : Need to add a modal

export default function SensCalcDisplay({ selected, observation }: SensCalcDisplayProps) {
  const [lvl, setLvl] = React.useState(STATUS_PARTIAL);

  React.useEffect(() => {
    const getSensCalc = async () => {
      const response = await getSensitivityCalculatorAPIData(
        observation.telescope,
        observation.subarray
      );
      setLvl(response?.calculate?.status ? STATUS_OK : STATUS_ERROR);
    };

    if (!selected) {
      setLvl(STATUS_INITIAL);
    } else {
      getSensCalc();
    }
  }, [selected]);

  return (
    <IconButton aria-label="SensCalc Status" style={{ cursor: 'hand' }}>
      <StatusIcon ariaTitle="" testId="statusId" icon level={lvl} size={SIZE} />
    </IconButton>
  );
}
