import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import AddIcon from '@mui/icons-material/Add';

export default function AddObservationButton() {
  const ClickFunction = () => {
    // TODO
  };

  const title = 'Add observation';

  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Secondary}
      icon={<AddIcon />}
      label={title}
      onClick={ClickFunction}
      testId={`${title}Button`}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
