import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Grid, IconButton, Typography } from '@mui/material';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { NAV } from '../../../utils/constants';

interface StatusWrapperProps {
  level?: number;
  page: number;
}

export default function StatusWrapper({ level = 5, page }: StatusWrapperProps) {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const SIZE = 35;

  const ClickFunction = () => {
    navigate(NAV[page]);
  };

  const getLevel = () => (level > 5 ? 0 : level);

  return (
    <IconButton aria-label="Page Status" onClick={ClickFunction} style={{ cursor: 'hand' }}>
      <Grid container direction="column" alignItems="center" justifyContent="center">
        <StatusIcon
          ariaTitle={t('pageStatus.toolTip')}
          ariaDescription={t('pageStatus.toolTip')}
          testId="statusId"
          icon
          level={getLevel()}
          size={SIZE}
        />
        <Typography variant="caption">{t(`page.${page}.title`)}</Typography>
      </Grid>
    </IconButton>
  );
}
