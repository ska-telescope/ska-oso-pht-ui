import React from 'react';
import { t } from 'i18next';
import { presentUnits, presentValue } from '@utils/present/present';
import StatusIconDisplay from '../../../icon/status/statusIcon';
import SensCalcModalSingle from '../../sensCalcModal/single/SensCalcModalSingle';
import { SENSITIVITY_STATE, STATUS_ERROR } from '../../../../utils/constants';
import TargetObservation from '@utils/types/targetObservation.tsx';
import { sensitivityStatusLevel } from '@utils/helpersSensCalc';
import { SENSITIVITY_FIELDS } from '@/services/sensitivityCalculator/results';

interface SensCalcDisplaySingleProps {
  targetObservation?: TargetObservation;
  show?: boolean;
  field: string;
  isCustom?: boolean;
}

export default function SensCalcDisplaySingle({
  targetObservation,
  show = false,
  field,
  isCustom = false
}: SensCalcDisplaySingleProps) {
  const [openDialog, setOpenDialog] = React.useState(false);

  const IconClicked = () => {
    setOpenDialog(true);
  };

  const results = targetObservation?.sensitivity;
  // Shown as an error when the link has no results
  const level = results ? sensitivityStatusLevel(results.state) : STATUS_ERROR;

  const ariaStatusMessage = () =>
    t('sensitivityCalculatorResults.status', {
      status: t('statusLoading.' + level),
      error: results?.state === SENSITIVITY_STATE.FAILED ? results.error : ''
    });

  // The field's value from the continuum results of a continuum observation, otherwise from the
  // spectral ones. The field is the label of one of SENSITIVITY_FIELDS, e.g. SensitivityWeighted.
  const values =
    results?.state === SENSITIVITY_STATE.DONE ? (results.continuum ?? results.spectral) : undefined;
  const shownField = SENSITIVITY_FIELDS.find((f) => f.label === field);
  const shownValue = values && shownField ? values[shownField.key] : undefined;

  const isDisabled = () => results?.state !== SENSITIVITY_STATE.DONE;

  // Shown for a result the calculator didn't give: the ones that depend on the synthesized beam,
  // which a custom subarray or a non-Gaussian beam has none of
  const notAvailable = t(
    isCustom
      ? 'sensitivityCalculatorResults.customArray'
      : 'sensitivityCalculatorResults.nonGaussian'
  );
  const shownText = () => {
    if (!values || !shownField) {
      return '';
    }
    return shownValue
      ? presentValue(shownValue.value) + ' ' + presentUnits(shownValue.unit)
      : notAvailable;
  };

  return (
    <>
      {show && field === 'icon' && (
        <StatusIconDisplay
          ariaTitle={ariaStatusMessage()}
          disabled={isDisabled()}
          text={''}
          onClick={isDisabled() ? undefined : IconClicked}
          testId="statusId"
          toolTip={ariaStatusMessage()}
          level={level}
        />
      )}
      {show && field !== 'icon' && <div data-testid={`field-${field}`}>{shownText()}</div>}
      {show && field === 'icon' && openDialog && (
        <SensCalcModalSingle
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          targetObservation={targetObservation}
        />
      )}
    </>
  );
}
