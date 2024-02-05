import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import CalculateIcon from '@mui/icons-material/Calculate';
import getSensitivityCalculatorAPIData from '../../../services/axios/sensitivityCalculator/getSensitivityCalculatorAPIData';

export default function TMPSensCalConnectButton({ onClick }) {
  const ClickFunction = async () => {
    // Mid Continuum
    const response1 = await getSensitivityCalculatorAPIData('Mid', 'Continuum');
    // Mid Zoom
    // const response2 = await getSensitivityCalculatorAPIData('Mid', 'Zoom');
    // Low Continuum
    // const response3 = await getSensitivityCalculatorAPIData('Low', 'Continuum');
    // Low Zoom
    // const response4 = await getSensitivityCalculatorAPIData('Low', 'Zoom');
    onClick(response1); // TODO: pass responses to Observation pages properly
    // TODO: add testing when displaying results from the API in UI
  };

  const title = 'TMP BUTTON';

  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Warning}
      label={title}
      onClick={ClickFunction}
      testId={`${title}Button`}
      variant={ButtonVariantTypes.Contained}
      icon={<CalculateIcon />}
    />
  );
}
