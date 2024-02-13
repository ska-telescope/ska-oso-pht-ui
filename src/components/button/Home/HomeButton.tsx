import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import HomeIcon from '@mui/icons-material/Home';
import { PATH } from '../../../utils/constants';
import { env } from 'env';

export default function HomeButton() {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();

  const ClickFunction = () => {
    navigate(env.REACT_APP_SKA_PHT_BASE_URL + PATH[0]);
  };

  const title = t('button.home');

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
