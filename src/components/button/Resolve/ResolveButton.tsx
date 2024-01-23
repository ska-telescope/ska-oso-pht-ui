'useClient';

import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import ResolveTarget from '../../../services/axios/resolveTarget/resolveTarget';

export default function ResolveButton({ targetName, onClick}) {
  const ClickFunction = async () => {
    const response = await ResolveTarget(targetName);
    onClick(response);
  };

  const title = 'Resolve';

  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Secondary}
      label={title}
      onClick={ClickFunction}
      testId={`${title}Button`}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
