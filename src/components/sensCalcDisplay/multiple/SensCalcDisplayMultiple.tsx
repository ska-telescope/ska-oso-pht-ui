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
  elementsT?: any[];
}

export default function SensCalcDisplayMultiple({
  observation,
  elementsT = []
}: SensCalcDisplayMultipleProps) {
  const { t } = useTranslation('pht');

  const [openDialog, setOpenDialog] = React.useState(false);

  const IconClicked = () => {
    setOpenDialog(true);
  };

  const convertedData = () => {
    const results = [];
    if (elementsT?.length > 0) {
      elementsT.forEach(rec => {
        if (typeof rec === 'undefined') {
          return;
        }
        if (rec.status === STATUS_PARTIAL) {
          results.push(rec);
          return;
        }
        const tempResults = {
          id: rec.id,
          error: rec.error,
          title: rec.title,
          status: rec.status,
          field1: rec.section1?.length > 0 ? rec.section1[0].value : '',
          field2: rec.section1?.length > 1 ? rec.section1[1].value : '',
          field3: rec.section1?.length > 2 ? rec.section1[2].value : '',
          field4: rec.section1?.length > 3 ? rec.section1[3].value : '',
          field5: rec.section1?.length > 4 ? rec.section1[4].value : '',
          field6: rec.section2?.length > 0 ? rec.section2[0].value : '',
          field7: rec.section2?.length > 1 ? rec.section2[1].value : '',
          field8: rec.section2?.length > 2 ? rec.section2[2].value : '',
          field9: rec.section2?.length > 3 ? rec.section2[3].value : '',
          field10: rec.section2?.length > 4 ? rec.section2[4].value : '',
          field11: rec.section2?.length > 0 ? rec.section3[0].value : ''
        };
        results.push(tempResults);
      });
    }
    return results;
  };

  const getLevel = () => {
    let result = STATUS_INITIAL;
    elementsT?.forEach(rec => {
      if (typeof rec !== 'undefined') {
        switch (rec.status) {
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
      }
    });
    return result;
  };

  const getError = () => {
    let result = '';
    elementsT.forEach(rec => {
      if (typeof rec !== 'undefined' && rec.status === STATUS_ERROR) {
        result = rec.error;
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
