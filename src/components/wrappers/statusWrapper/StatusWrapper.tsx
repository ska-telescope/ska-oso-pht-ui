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
  const SIZE = 30;

  const ClickFunction = () => {
    navigate(NAV[page]);
  };

  const getLevel = () => (level > 5 ? 0 : level);
  const pageName = () => {
    return t(`page.${page}.title`);
  };

  return (
    <IconButton aria-label="Page Status" onClick={ClickFunction} style={{ cursor: 'hand' }}>
      <Grid container direction="column" alignItems="center" justifyContent="center">
        <StatusIcon
          ariaTitle={t('pageStatus.toolTip', {
            pageName: pageName().toLowerCase(),
            status: t('statusValue.' + getLevel())
          })}
          ariaDescription={t('pageStatus.toolTip', {
            pageName: pageName().toLowerCase(),
            status: t('statusValue.' + getLevel())
          })}
          testId="statusId"
          icon
          level={getLevel()}
          size={SIZE}
        />
        <Typography variant="caption">{pageName()}</Typography>
      </Grid>
    </IconButton>
  );
}
