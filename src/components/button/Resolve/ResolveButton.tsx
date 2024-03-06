import React from 'react';
import { useTranslation } from 'react-i18next';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import GetCoordinates from '../../../services/axios/getCoordinates/getCoordinates';
import { Tooltip, IconButton } from '@mui/material';

export default function ResolveButton({ targetName, onClick }) {
  const { t } = useTranslation('pht');

  const ClickFunction = async () => {
    const response = await GetCoordinates(targetName);
    onClick(response);
  };

  const title = t('button.resolve');

  return (
    <Tooltip title={title} arrow>
      <IconButton
        aria-label={`${title}Button`}
        onClick={ClickFunction}
        style={{ cursor: 'pointer' }}
      >
        <MyLocationIcon />
      </IconButton>
    </Tooltip>
  );
}
