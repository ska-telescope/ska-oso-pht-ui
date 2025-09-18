import React from 'react';
import { useMsal } from '@azure/msal-react';
import { Box, Divider, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ButtonUserMenu } from '@ska-telescope/ska-login-page';
import { ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import { useNavigate } from 'react-router-dom';
import { PMT, PATH, isCypress } from '@/utils/constants';
import { isReviewerAdmin, isReviewerChair, isReviewer } from '@/utils/aaa/aaaUtils';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

export default function UserMenuWrapper(): JSX.Element {
  const [cypressLogin, setCypressLogin] = React.useState('');
  const { t } = useScopedTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { accounts } = useMsal();
  const username = accounts.length > 0 ? accounts[0].name + cypressLogin : cypressLogin;

  React.useEffect(() => {
    const accountStr = localStorage.getItem('cypress:account');
    const account = accountStr ? JSON.parse(accountStr) : null;
    if (account && isCypress) {
      setCypressLogin(account.name);
    }
  }, []);

  const onMenuSelect = (thePath: string) => {
    navigate(thePath);
  };

  return (
    <Box>
      <ButtonUserMenu
        label={username}
        colorBG={theme.palette.primary.main}
        colorFG={theme.palette.primary.contrastText}
        showPhoto
        showUsername
        variant={ButtonVariantTypes.Text}
        toolTip="Additional user functionality including sign out"
      >
        {isReviewerAdmin() && (
          <div data-testid="menuItemOverview" onClick={() => onMenuSelect(PMT[2])}>
            <Typography variant="subtitle2">{t('overview.title')}</Typography>
          </div>
        )}
        {(isReviewerAdmin() || isReviewer()) && (
          <div data-testid="menuItemProposals" onClick={() => onMenuSelect(PATH[0])}>
            <Typography variant="subtitle2">{t('homeBtn.title')}</Typography>
          </div>
        )}
        {isReviewerAdmin() && (
          <div data-testid="menuItemPanelSummary" onClick={() => onMenuSelect(PMT[0])}>
            <Typography variant="subtitle2">{t('page.15.title')}</Typography>
          </div>
        )}
        {isReviewer() && (
          <div data-testid="menuItemReviews" onClick={() => onMenuSelect(PMT[1])}>
            <Typography variant="subtitle2">{t('reviewProposalList.title')}</Typography>
          </div>
        )}
        {isReviewerChair() && (
          <div data-testid="menuItemReviewDecisions" onClick={() => onMenuSelect(PMT[4])}>
            <Typography variant="subtitle2">{t('reviewDecisionsList.title')}</Typography>
          </div>
        )}
        {(isReviewerAdmin() || isReviewer()) && <Divider component="div" sx={{ my: 1 }} />}
      </ButtonUserMenu>
    </Box>
  );
}
