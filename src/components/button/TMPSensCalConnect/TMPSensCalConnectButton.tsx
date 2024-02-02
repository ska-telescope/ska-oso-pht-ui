'useClient';

import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import CalculateIcon from '@mui/icons-material/Calculate';
import GetCalculate from '../../../services/axios/sensitivityCalculator/MID/getMidCalculate/getCalculate';
import GetMidWeighting from '../../../services/axios/sensitivityCalculator/MID/getMidWeighting/getMidWeighting';

export default function TMPSensCalConnectButton({ onClick }) {
  const ClickFunction = async () => {
    /* 3 calls for Mid Continuum */
    const responseCalculate = await GetCalculate('Mid', 'Continuum');
    const responseWeightingContinuum = await GetMidWeighting('Mid','Continuum');
    const responseWeightingLine = await GetMidWeighting('Mid','Zoom');

    /* 2 calls for Mid Zoom */
    const responseCalculate2 = await GetCalculate('Mid', 'Zoom');
    const responseWeightingLine2 = await GetMidWeighting('Mid','Zoom');

    /* 3 calls for Low Continuum */
    const responseCalculateLow = await GetCalculate('Low', 'Continuum');

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
