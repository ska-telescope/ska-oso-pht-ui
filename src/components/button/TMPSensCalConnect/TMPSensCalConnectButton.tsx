'useClient';

import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import CalculateIcon from '@mui/icons-material/Calculate';
import GetMidCalculate from '../../../services/axios/sensitivityCalculator/MID/getMidCalculate/getMidCalculate';
import GetMidWeighting from '../../../services/axios/sensitivityCalculator/MID/getMidWeighting/getMidWeighting';

export default function TMPSensCalConnectButton({ onClick }) {
  const ClickFunction = async () => {
    /* 3 calls for Mid Continuum */
    const responseCalculate = await GetMidCalculate('Continuum');
    const responseWeightingContinuum = await GetMidWeighting('Continuum');
    const responseWeightingLine = await GetMidWeighting('Zoom');

    /* 2 calls for Mid Zoom */
    const responseCalculate2 = await GetMidCalculate('Zoom');
    const responseWeightingLine2 = await GetMidWeighting('Zoom');

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
