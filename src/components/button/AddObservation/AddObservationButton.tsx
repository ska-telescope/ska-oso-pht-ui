import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import AddIcon from '@mui/icons-material/Add';

export default function AddObservationButton() {
  const navigate = useNavigate();

  const ClickFunction = () => {
    navigate('/AddObservation');
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
