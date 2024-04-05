import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import AddIcon from '@mui/icons-material/Add';
import { PATH } from '../../../utils/constants';

export default function AddDataProductButton() {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();

  const ClickFunction = () => {
    navigate(PATH[3]);
  };

  const title = t('dataProduct.button');

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
