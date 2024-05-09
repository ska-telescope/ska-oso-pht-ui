import React from 'react';
import { useTranslation } from 'react-i18next';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import GetCoordinates from '../../../services/axios/getCoordinates/getCoordinates';
import {
  Button,
  ButtonColorTypes,
  ButtonSizeTypes,
  ButtonVariantTypes
} from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/material';

export default function ResolveButton({ targetName, skyUnits, onClick }) {
  const { t } = useTranslation('pht');

  const ClickFunction = async () => {
    const response = await GetCoordinates(targetName, skyUnits);
    onClick(response);
  };

  const title = t('resolve.label');

  return (
    <Box pb={1}>
      <Button
        ariaDescription={`${title}Button`}
        color={ButtonColorTypes.Inherit}
        disabled={targetName.length === 0}
        icon={<MyLocationIcon />}
        label={title}
        onClick={ClickFunction}
        size={ButtonSizeTypes.Small}
        testId={`${title}Button`}
        toolTip={t('resolve.toolTip')}
        variant={ButtonVariantTypes.Contained}
      />
    </Box>
  );
}
