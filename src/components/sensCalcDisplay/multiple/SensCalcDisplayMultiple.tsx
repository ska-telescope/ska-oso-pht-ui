import React from 'react';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import getSensCalc from '../../../services/axios/sensitivityCalculator/getSensitivityCalculatorAPIData';
import { IconButton } from '@mui/material';
import SensCalcModalMultiple from '../../alerts/sensCalcModal/multiple/SensCalcModalMultiple';
import Observation from '../../../utils/types/observation';
import { STATUS_INITIAL } from '../../../utils/constants';
import { Proposal } from '../../../utils/types/proposal';
import Target from '../../../utils/types/target';

const SIZE = 20;

interface SensCalcDisplayMultipleProps {
  observation: Observation;
}

export default function SensCalcDisplayMultiple({ observation }: SensCalcDisplayMultipleProps) {
  const [openDialog, setOpenDialog] = React.useState(false);
  const { application } = storageObject.useStore();
  const [results, setResults] = React.useState([]);
  const [targets, setTargets] = React.useState([]);

  const getProposal = () => application.content2 as Proposal;

  React.useEffect(() => {
    if (openDialog) {
      setTargets([]);
      const results = getProposal().targetObservation.filter(
        item => item.observationId === observation.id
      );
      setTargets(results);
    }
  }, [openDialog]);

  const getTarget = (id: number): Target => {
    const index = getProposal().targets.findIndex(obj => obj.id === id);
    return index > -1 ? getProposal().targets[index] : null;
  };

  React.useEffect(() => {
    const arr = [];
    targets?.map(async rec => {
      const target: Target = getTarget(rec.targetId);
      const values = await getSensCalc(observation, target);
      arr.push({
        id: rec.targetId,
        title: target?.name,
        status: values.status,
        field1: values.section1?.length ? values.section1[0].value : null,
        field2: values.section1?.length ? values.section1[1].value : null,
        field3: values.section1?.length ? values.section1[2].value : null,
        field4: values.section1?.length ? values.section1[3].value : null,
        field5: values.section1?.length ? values.section1[4].value : null,
        field6:
          values.section1?.length && values.section2?.length >= 1 ? values.section2[0].value : null,
        field7:
          values.section1?.length && values.section2?.length >= 2 ? values.section2[1].value : null,
        field8:
          values.section1?.length && values.section2?.length >= 3 ? values.section2[2].value : null,
        field9:
          values.section1?.length && values.section2?.length >= 4 ? values.section2[3].value : null,
        field10:
          values.section1?.length && values.section2?.length >= 5 ? values.section2[4].value : null,
        field11: values.section1?.length ? values.section3[0].value : null,

        units1: values.section1?.length ? values.section1[0].units : null,
        units2: values.section1?.length ? values.section1[1].units : null,
        units3: values.section1?.length ? values.section1[2].units : null,
        units4: values.section1?.length ? values.section1[3].units : null,
        units5: values.section1?.length ? values.section1[4].units : null,
        units6:
          values.section1?.length && values.section2?.length >= 1 ? values.section2[0].units : null,
        units7:
          values.section1?.length && values.section2?.length >= 2 ? values.section2[1].units : null,
        units8:
          values.section1?.length && values.section2?.length >= 3 ? values.section2[2].units : null,
        units9:
          values.section1?.length && values.section2?.length >= 4 ? values.section2[3].units : null,
        units10:
          values.section1?.length && values.section2?.length >= 5 ? values.section2[4].units : null,
        units11: values.section1?.length ? values.section3[0].units : null
      });
      return true;
    });
    setResults(arr);
  }, [targets]);

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
        observation={observation}
      />
    </>
  );
}
