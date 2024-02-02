'useClient';

import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import CalculateIcon from '@mui/icons-material/Calculate';
import GetCalculate from '../../../services/axios/sensitivityCalculator/getCalculate/getCalculate';
import GetWeighting from '../../../services/axios/sensitivityCalculator/getWeighting/getWeighting';

export default function TMPSensCalConnectButton({ onClick }) {
  const ClickFunction = async () => {
    /* 3 calls for Mid Continuum */
    const responseCalculate = await GetCalculate('Mid', 'Continuum');
    const responseWeightingContinuum = await GetWeighting('Mid','Continuum');
    const responseWeightingLine = await GetWeighting('Mid','Zoom');
    console.log('Mid Continuum call', responseCalculate, responseWeightingContinuum, responseWeightingLine);

    /* 2 calls for Mid Zoom */
    const responseCalculate2 = await GetCalculate('Mid', 'Zoom');
    const responseWeightingLine2 = await GetWeighting('Mid','Zoom');
    console.log('Mid Zoom call', responseCalculate2, responseWeightingLine2);

    /* 3 calls for Low Continuum */
    const responseCalculateLow = await GetCalculate('Low', 'Continuum');
    const responseWeightingContinuumLow = await GetWeighting('Low','Continuum');
    const responseWeightingLineLow = await GetWeighting('Low','Zoom');
    console.log('Low Continuum call', responseCalculateLow, responseWeightingContinuumLow, responseWeightingLineLow);

    /* 2 calls for Low Zoom */
    const responseCalculateLow2 = await GetCalculate('Low', 'Zoom');
    const responseWeightingLineLow2 = await GetWeighting('Low','Zoom');
    console.log('Low Continuum call', responseCalculateLow2, responseWeightingLineLow2);

    const response = {
      responseCalculate,
      responseWeightingContinuum,
      responseWeightingLine
    }
    onClick(response);
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
