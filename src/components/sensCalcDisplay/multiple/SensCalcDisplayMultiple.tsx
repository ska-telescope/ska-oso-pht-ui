import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@mui/material';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import SensCalcModalMultiple from '../../alerts/sensCalcModal/multiple/SensCalcModalMultiple';
import { STATUS_ERROR, STATUS_INITIAL, STATUS_OK, STATUS_PARTIAL } from '../../../utils/constants';
import Observation from '../../../utils/types/observation';

const SIZE = 20;

interface SensCalcDisplayMultipleProps {
  observation: Observation;
  elementsT: [];
}

export default function SensCalcDisplayMultiple({
  observation,
  elementsT
}: SensCalcDisplayMultipleProps) {
  const { t } = useTranslation('pht');

  const [openDialog, setOpenDialog] = React.useState(false);

  const IconClicked = () => {
    setOpenDialog(true);
  };

  const convertedData = () => {
    const results = [];
    elementsT.forEach(rec => {
      const tmp: any = rec;
      if (tmp.status === STATUS_PARTIAL) {
        results.push(rec);
        return;
      }
      const tempResults = {
        id: tmp.id,
        error: tmp.error,
        title: tmp.title,
        status: tmp.status,
        field1: tmp.section1[0].value,
        field2: tmp.section1[1].value,
        field3: tmp.section1[2].value,
        field4: tmp.section1[3].value,
        field5: tmp.section1[4].value,
        field6: tmp.section2[0].value,
        field7: tmp.section2[1].value,
        field8: tmp.section2[2].value,
        field9: tmp.section2[3].value,
        field10: tmp.section2[4].value,
        field11: tmp.section3[0].value
      };
      results.push(tempResults);
    });
    return results;
  };

  const getLevel = () => {
    let result = STATUS_INITIAL;
    elementsT.forEach(rec => {
      const e: any = rec;
      switch (e.status) {
        case STATUS_ERROR:
          result = STATUS_ERROR;
          return;
        case STATUS_PARTIAL:
          result = result !== STATUS_ERROR ? STATUS_PARTIAL : STATUS_ERROR;
          return;
        default:
          if (result !== STATUS_PARTIAL && result !== STATUS_ERROR) {
            result = STATUS_OK;
          }
      }
    });
    return result;
  };

  const getError = () => {
    let result = '';
    elementsT.forEach(rec => {
      const e: any = rec;
      if (e.status === STATUS_ERROR) {
        result = e.error;
      }
    });
    return result;
  };

  return (
    <>
      <IconButton aria-label="SensCalc Status" style={{ cursor: 'hand' }} onClick={IconClicked}>
        <StatusIcon
          ariaTitle={t('sensitivityCalculatorResults.status', {
            status: t('statusLoading.' + getLevel()),
            error: getError()
          })}
          testId="statusId"
          icon
          level={getLevel()}
          size={SIZE}
        />
      </IconButton>
      {observation && (
        <SensCalcModalMultiple
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          data={convertedData()}
          observation={observation}
          level={getLevel()}
          levelError={getError()}
        />
      )}
    </>
  );
}
