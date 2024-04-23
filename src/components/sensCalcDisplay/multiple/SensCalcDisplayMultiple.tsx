import React from 'react';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import getSensCalc, { SensCalcResult } from '../../../services/axios/sensitivityCalculator/getSensitivityCalculatorAPIData';
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
    var arr = new Array();
    targets?.map(async rec => {
      const target: Target = getTarget(rec.targetId);
      const values = await getSensCalc(observation, target);
      console.log('TAS', values);
      const item = {
        id: rec.targetId,
        title: target?.name,
        status: values.status,
        field1: values.section1?.length > 0 ? values.section1[0].value : '',
        field2: values.section1?.length > 1 ? values.section1[1].value : '',
        field3: values.section1?.length > 2 ? values.section1[2].value : '',
        field4: values.section1?.length > 3 ? values.section1[3].value : '',
        field5: values.section1?.length > 4 ? values.section1[4].value : '',
        field6: values.section2?.length > 0 ? values.section2[0].value : '',
        field7: values.section2?.length > 1 ? values.section2[1].value : '',
        field8: values.section2?.length > 2 ? values.section2[2].value : '',
        field9: values.section2?.length > 3 ? values.section2[3].value : '',
        field10: values.section2?.length > 4 ? values.section2[4].value : '',
        field11: values.section3?.length > 0 ? values.section3[0].value : '',

        units1: values.section1?.length > 0 ? values.section1[0].units : '',
        units2: values.section1?.length > 1 ? values.section1[1].units : '',
        units3: values.section1?.length > 2 ? values.section1[2].units : '',
        units4: values.section1?.length > 3 ? values.section1[3].units : '',
        units5: values.section1?.length > 4 ? values.section1[4].units : '',
        units6: values.section2?.length > 0 ? values.section2[0].units : '',
        units7: values.section2?.length > 1 ? values.section2[1].units : '',
        units8: values.section2?.length > 2 ? values.section2[2].units : '',
        units9: values.section2?.length > 3 ? values.section2[3].units : '',
        units10: values.section2?.length > 4 ? values.section2[4].units : '',
        units11: values.section3?.length > 0 ? values.section3[0].units : ''
      };
      arr.push(item);
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
