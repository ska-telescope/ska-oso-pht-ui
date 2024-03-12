import React from 'react';
import { useTranslation } from 'react-i18next';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import GetCoordinates from '../../../services/axios/getCoordinates/getCoordinates';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';

export default function ResolveButton({ targetName, onClick }) {
  const { t } = useTranslation('pht');

  const ClickFunction = async () => {
    const response = await GetCoordinates(targetName);
    onClick(response);
  };

  const title = t('button.resolve');

  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Inherit}
      icon={<MyLocationIcon />}
      label={title}
      onClick={ClickFunction}
      testId={`${title}Button`}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
