import React from 'react';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import getSensCalc from '../../../services/axios/sensitivityCalculator/getSensitivityCalculatorAPIData';
import { IconButton } from '@mui/material';
import SensCalcModalMultiple from '../../alerts/sensCalcModalSingle/multiple/SensCalcModalMultiple';
import Observation from '../../../utils/types/observation';
import { STATUS_INITIAL } from '../../../utils/constants';

const SIZE = 20;

interface SensCalcDisplayMultipleProps {
  observation: Observation;
}

export default function SensCalcDisplayMultiple({ observation }: SensCalcDisplayMultipleProps) {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [results, setResults] = React.useState([]);

  React.useEffect(() => {
    const values = getSensCalc(observation, null);
    const arr = [];
    arr.push({
      id: 1,
      status: values.status,
      field1: values.section1?.length ? values.section1[0].value : null,
      field2: values.section1?.length ? values.section1[1].value : null,
      field3: values.section1?.length ? values.section1[2].value : null,
      field4: values.section1?.length ? values.section1[3].value : null,
      field5: values.section1?.length ? values.section1[4].value : null,
      field6: values.section1?.length ? values.section2[0].value : null,
      field7: values.section1?.length ? values.section2[1].value : null,
      field8: values.section1?.length ? values.section2[2].value : null,
      field9: values.section1?.length ? values.section2[3].value : null,
      field10: values.section1?.length ? values.section2[4].value : null,
      field11: values.section1?.length ? values.section3[0].value : null,
      field12: values.section1?.length ? values.section3[1].value : null,
      field13: values.section1?.length ? values.section3[2].value : null
    });
    setResults(arr);
  }, []);

  const IconClicked = () => {
    setOpenDialog(true);
  };

  return (
    <>
      <IconButton aria-label="SensCalc Status" style={{ cursor: 'hand' }} onClick={IconClicked}>
        <StatusIcon ariaTitle="" testId="statusId" icon level={STATUS_INITIAL} size={SIZE} />
      </IconButton>
      <SensCalcModalMultiple
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        data={results}
      />
    </>
  );
}
