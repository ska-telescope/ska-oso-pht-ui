import React from 'react';
import { t } from 'i18next';
import { presentSensCalcError, presentUnits, presentValue } from '@utils/present/present';
import StatusIconDisplay from '../../../icon/status/statusIcon';
import SensCalcModalSingle from '../../sensCalcModal/single/SensCalcModalSingle';
import { OBS_TYPES, STATUS_OK } from '../../../../utils/constants';

const VALUE = 'value';
const UNITS = 'units';

interface SensCalcDisplaySingleProps {
  sensCalc: any;
  show?: boolean;
  field: string;
  isCustom?: boolean;
  isNatural?: boolean;
}

export default function SensCalcDisplaySingle({
  sensCalc,
  show = false,
  field,
  isCustom = false,
  isNatural = false
}: SensCalcDisplaySingleProps) {
  const [openDialog, setOpenDialog] = React.useState(false);

  const IconClicked = () => {
    setOpenDialog(true);
  };

  const ariaStatusMessage = (sensCalc: { statusGUI: string; error: string }) => {
    const status = t('statusLoading.' + sensCalc?.statusGUI);
    const error = sensCalc?.error?.length ? t(presentSensCalcError(sensCalc?.error)) : '';
    return t('sensitivityCalculatorResults.status', { status: status, error: error });
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

  const isDisabled = () => sensCalc?.statusGUI !== STATUS_OK;

  const PresentCustomResultValue = () => {
    if (isNatural) {
      return t('sensitivityCalculatorResults.nonGaussian');
    }
    return t('sensitivityCalculatorResults.customArray');
  };

  return (
    <>
      {show && field === 'icon' && (
        <StatusIconDisplay
          ariaDescription={ariaStatusMessage(sensCalc)}
          ariaTitle={ariaStatusMessage(sensCalc)}
          disabled={isDisabled()}
          text={''}
          onClick={isDisabled() ? undefined : IconClicked}
          testId="statusId"
          toolTip={ariaStatusMessage(sensCalc)}
          level={sensCalc?.statusGUI}
        />
      )}
      {show && field !== 'icon' && (
        <div data-testid={`field-${field}`}>
          {(isNatural || isCustom) && field === 'SynthBeamSize'
            ? PresentCustomResultValue()
            : presentValue(FieldFetch(VALUE, field)) + ' ' + presentUnits(FieldFetch(UNITS, field))}
        </div>
      )}
      {show && field === 'icon' && openDialog && (
        <SensCalcModalSingle
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          data={sensCalc}
          isCustom={isCustom}
          isNatural={isNatural}
        />
      )}
    </>
  );
}
