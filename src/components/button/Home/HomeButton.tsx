'useClient';

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import HomeIcon from '@mui/icons-material/Home';

export default function HomeButton() {
  const navigate = useNavigate();

  const ClickFunction = () => {
    navigate('/');
  };

  const title = 'Home';

  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Inherit}
      icon={<HomeIcon />}
      label={title}
      onClick={ClickFunction}
      testId={`${title}Button`}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
