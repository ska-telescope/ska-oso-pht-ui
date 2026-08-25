import React from 'react';
import { t } from 'i18next';
import { presentSensCalcError, presentUnits, presentValue } from '@utils/present/present';
import StatusIconDisplay from '../../../icon/status/statusIcon';
import SensCalcModalSingle from '../../sensCalcModal/single/SensCalcModalSingle';
import { STATUS_OK, TYPE_ZOOM, TYPE_CONTINUUM, STATUS_ERROR } from '../../../../utils/constants';
import TargetObservation from '@utils/types/targetObservation.tsx';

const VALUE = 'value';
const UNITS = 'units';

interface SensCalcDisplaySingleProps {
  targetObservation?: TargetObservation;
  show?: boolean;
  field: string;
  isCustom?: boolean;
  isNatural?: boolean;
}

export default function SensCalcDisplaySingle({
  targetObservation,
  show = false,
  field,
  isCustom = false,
  isNatural = false
}: SensCalcDisplaySingleProps) {
  const [openDialog, setOpenDialog] = React.useState(false);

  const IconClicked = () => {
    setOpenDialog(true);
  };

  const ariaStatusMessage = (sensCalc?: { statusGUI: string; error: string }) => {
    const status = t('statusLoading.' + sensCalc?.statusGUI);
    const error = sensCalc?.error?.length ? t(presentSensCalcError(sensCalc?.error)) : '';
    return t('sensitivityCalculatorResults.status', { status: status, error: error });
  };

  const FieldFetch: any = (type: string, field: string) => {
    const observationTypeLabel: string =
      targetObservation?.sensCalc?.section2?.length > 0 ? TYPE_CONTINUUM : TYPE_ZOOM;
    if (targetObservation?.sensCalc?.section1) {
      const result = targetObservation?.sensCalc?.section1.find(
        (item: { field: string }) => item.field === `${observationTypeLabel}${field}`
      );
      return result ? result[type] : '';
    }
    return '';
  };

  const isDisabled = () => targetObservation?.sensCalc?.statusGUI !== STATUS_OK;

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
          ariaDescription={ariaStatusMessage(targetObservation?.sensCalc)}
          ariaTitle={ariaStatusMessage(targetObservation?.sensCalc)}
          disabled={isDisabled()}
          text={''}
          onClick={isDisabled() ? undefined : IconClicked}
          testId="statusId"
          toolTip={ariaStatusMessage(targetObservation?.sensCalc)}
          level={targetObservation?.sensCalc?.statusGUI ?? STATUS_ERROR}
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
          targetObservation={targetObservation}
          isNatural={isNatural}
        />
      )}
    </>
  );
}
