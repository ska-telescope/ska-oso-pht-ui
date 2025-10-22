import { useNavigate } from 'react-router-dom';
import { Grid, IconButton, Typography } from '@mui/material';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { cypressToken, NAV, STATUS_ERROR_SYMBOL } from '@utils/constants.ts';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import Proposal from '@utils/types/proposal.tsx';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface StatusWrapperProps {
  level?: number;
  page: number;
}

export default function StatusWrapper({ level = 5, page }: StatusWrapperProps) {
  const { t } = useScopedTranslation();
  const navigate = useNavigate();
  const SIZE = 30;
  const loggedIn = isLoggedIn();
  const { application } = storageObject.useStore();
  const getProposal = () => application.content2 as Proposal;

  const ClickFunction = () => {
    navigate(NAV[page]);
  };

  const disableIcons = () => {
    if (!loggedIn && !cypressToken) {
      switch (pageName()) {
        case 'Target':
        case 'Observation':
          return false;
        default:
          return true;
      }
    } else if (loggedIn && getProposal().id == null) {
      switch (pageName()) {
        case 'Title':
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
        <div style={{ all: 'initial', display: 'inline-block' }}>
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
            icon={getLevel() === 1 ? false : true}
            text={getLevel() === 1 ? STATUS_ERROR_SYMBOL : ''}
            level={getLevel()}
            size={SIZE}
          />
        </div>
        <Typography variant="caption">{pageName()}</Typography>
      </Grid>
    </IconButton>
  );
}
