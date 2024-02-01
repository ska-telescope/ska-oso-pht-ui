'useClient';

import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import CalculateIcon from '@mui/icons-material/Calculate';
import GetMidCalculate from '../../../services/axios/sensitivityCalculator/MID/getMidCalculate/getMidCalculate';

export default function TMPSensCalConnectButton({ onClick }) {
  const ClickFunction = async () => {
    const response = await GetMidCalculate();
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
