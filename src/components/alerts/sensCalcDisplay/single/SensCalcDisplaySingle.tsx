import React from 'react';
import { t } from 'i18next';
import { IconButton } from '@mui/material';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import SensCalcModalSingle from '../../sensCalcModal/single/SensCalcModalSingle';
import { OBS_TYPES, STATUS_OK } from '../../../../utils/constants';
import { presentSensCalcError, presentUnits, presentValue } from '../../../../utils/present';

const SIZE = 20;
const VALUE = 'value';
const UNITS = 'units';

interface SensCalcDisplaySingleProps {
  sensCalc: any;
  show: boolean;
  field: string;
}

export default function SensCalcDisplaySingle({
  sensCalc,
  show,
  field
}: SensCalcDisplaySingleProps) {
  const [openDialog, setOpenDialog] = React.useState(false);

  const IconClicked = () => {
    setOpenDialog(true);
  };

  const FieldFetch: any = (type: string, field: string) => {
    const observationTypeLabel: string =
      sensCalc?.section2?.length > 0 ? OBS_TYPES[1] : OBS_TYPES[0];
    if (sensCalc?.section1) {
      const result = sensCalc?.section1.find(
        (item: { field: string }) => item.field === `${observationTypeLabel}${field}`
      );
      return result ? result[type] : '';
    }
    return '';
  };

  return (
    <>
      {show && field === 'icon' && (
        <IconButton
          style={{ cursor: 'hand' }}
          onClick={sensCalc?.statusGUI === STATUS_OK ? IconClicked : null}
        >
          <StatusIcon
            ariaTitle={t('sensitivityCalculatorResults.status', {
              status: t('statusLoading.' + sensCalc?.statusGUI),
              error: t(presentSensCalcError(sensCalc?.error))
            })}
            testId="statusId"
            icon
            level={sensCalc?.statusGUI}
            size={SIZE}
          />
        </IconButton>
      )}
      {show && field !== 'icon' && (
        <>
          {presentValue(FieldFetch(VALUE, field))} {presentUnits(FieldFetch(UNITS, field))}
        </>
      )}
      {show && field === 'icon' && openDialog && (
        <SensCalcModalSingle
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          data={sensCalc}
        />
      )}
    </>
  );
}
