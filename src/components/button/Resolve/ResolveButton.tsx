'useClient';

import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import GetCoordinates from '../../../services/axios/getCoordinates/getCoordinates';

export default function ResolveButton({ targetName, onClick }) {
  const ClickFunction = async () => {
    const response = await GetCoordinates(targetName);
    onClick(response);
  };

  const title = 'Resolve';

  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Inherit}
      label={title}
      onClick={ClickFunction}
      testId={`${title}Button`}
      variant={ButtonVariantTypes.Contained}
      icon={<MyLocationIcon />}
    />
  );
}
