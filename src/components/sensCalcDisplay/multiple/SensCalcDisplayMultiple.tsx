import React from 'react';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import getSensCalc from '../../../services/axios/sensitivityCalculator/getSensitivityCalculatorAPIData';
import { IconButton } from '@mui/material';
import SensCalcModalMultiple from '../../alerts/sensCalcModal/multiple/SensCalcModalMultiple';
import Observation from '../../../utils/types/observation';
import { useTranslation } from 'react-i18next';
import { STATUS_ERROR, STATUS_INITIAL, STATUS_PARTIAL } from '../../../utils/constants';
import Target from '../../../utils/types/target';

const SIZE = 20;

interface SensCalcDisplayMultipleProps {
  observation: Observation;
  targets: Target[];
}

export type tempResults = {
  id: number;
  title: string;
  status: number;
  field1: string;
  field2: string;
  field3: string;
  field4: string;
  field5: string;
  field6: string;
  field7: string;
  field8: string;
  field9: string;
  field10: string;
  field11: string;

  units1: string;
  units2: string;
  units3: string;
  units4: string;
  units5: string;
  units6: string;
  units7: string;
  units8: string;
  units9: string;
  units10: string;
  units11: string;
};

export default function SensCalcDisplayMultiple({
  observation,
  targets
}: SensCalcDisplayMultipleProps) {
  const { t } = useTranslation('pht');
  const [openDialog, setOpenDialog] = React.useState(false);
  const [results, setResults] = React.useState([]);

  const updateResults = (target: Target, values: any) => {
    const item: tempResults = {
      id: target?.id,
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
    return item;
  };

  React.useEffect(() => {
    const getSensCalcData = async (target: Target) => {
      const response = await getSensCalc(observation, target);
      if (response) {
        const item = updateResults(target, response);
        setResults(results => [...results, item]);
      }
    };

    setResults([]);
    targets?.forEach(async rec => {
      getSensCalcData(rec);
    });
  }, [targets]);

  const IconClicked = () => {
    setOpenDialog(true);
  };

  const getLevel = () => {
    let result = STATUS_INITIAL;
    results.forEach(e => {
      switch (e.status) {
        case STATUS_ERROR:
          result = STATUS_ERROR;
          return;
        case STATUS_PARTIAL:
          result = result !== STATUS_ERROR ? STATUS_PARTIAL : STATUS_ERROR;
          return;
        default:
          if (result !== STATUS_PARTIAL && result !== STATUS_ERROR) {
            result = e;
          }
      }
      return;
    });
    return result;
  };

  return (
    <>
      <IconButton aria-label="SensCalc Status" style={{ cursor: 'hand' }} onClick={IconClicked}>
        <StatusIcon
          ariaTitle={t('sensitivityCalculatorResults.status', {
            status: t('statusValue.' + getLevel()),
            error: ''
          })}
          testId="statusId"
          icon
          level={getLevel()}
          size={SIZE}
        />
      </IconButton>
      <SensCalcModalMultiple
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        data={results}
        observation={observation}
        level={getLevel()}
      />
    </>
  );
}
