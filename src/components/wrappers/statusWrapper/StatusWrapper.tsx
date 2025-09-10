import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Grid, IconButton, Typography } from '@mui/material';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { NAV, STATUS_ERROR, STATUS_ERROR_SYMBOL } from '@utils/constants.ts';
import { isLoggedIn } from '@ska-telescope/ska-login-page';

interface StatusWrapperProps {
  level?: number;
  page: number;
}

export default function StatusWrapper({ level = 5, page }: StatusWrapperProps) {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const SIZE = 30;
  const loggedIn = isLoggedIn();

  const ClickFunction = () => {
    navigate(NAV[page]);
  };

  const disableIcons = () => {
    if (!loggedIn) {
      switch (pageName()) {
        case 'Title':
        case 'Target':
        case 'Observation':
          return false;
        default:
          return true;
      }
    }
  };

  const getLevel = () => (level > 5 ? 0 : level);
  const pageName = () => {
    return t(`page.${page}.status`);
  };

  return (
    <IconButton
      aria-label="Page Status"
      onClick={ClickFunction}
      style={{ cursor: 'hand' }}
      disabled={disableIcons()}
    >
      <Grid container direction="column" alignItems="center" justifyContent="center">
        <StatusIcon
          ariaDescription={t('pageStatus.toolTip', {
            pageName: pageName().toLowerCase(),
            status: t('statusValue.' + getLevel())
          })}
          ariaTitle={t('pageStatus.toolTip', {
            pageName: pageName().toLowerCase(),
            status: t('statusValue.' + getLevel())
          })}
          testId={'statusId' + page}
          toolTip={t('pageStatus.toolTip', {
            pageName: pageName().toLowerCase(),
            status: t('statusValue.' + getLevel())
          })}
          text={getLevel() === STATUS_ERROR ? STATUS_ERROR_SYMBOL : ''}
          icon={getLevel() !== STATUS_ERROR}
          level={getLevel()}
          size={SIZE}
        />
        <Typography variant="caption">{pageName()}</Typography>
      </Grid>
    </IconButton>
  );
}
