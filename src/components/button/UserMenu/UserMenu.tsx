import React from 'react';
import { useMsal } from '@azure/msal-react';
import { EventType } from '@azure/msal-browser';
import { Box, Divider, Menu, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ButtonLogin, ButtonUser, ButtonLogout, getUserInfo } from '@ska-telescope/ska-login-page';
import { ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import { useNavigate } from 'react-router-dom';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { PMT, PATH, isCypress, PAGE_PANEL_MANAGEMENT } from '@/utils/constants';
import {
  isReviewerAdmin,
  isReviewerChair,
  isReviewer,
  useInitializeAccessStore
} from '@/utils/aaa/aaaUtils';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { buildLoginRequest, getUseIndigo } from '@/utils/authConfig';
import { useNotify } from '@/utils/notify/useNotify';

export interface ButtonUserMenuProps {
  ariaDescription?: string;
  color?: typeof ButtonColorTypes;
  label?: string;
  logoutStart?: boolean;
  onClick?: Function;
  toolTip?: string;
}

export default function ButtonUserMenu({
  ariaDescription = 'User Button',
  label = 'Mocked',
  onClick,
  toolTip = 'Additional user functionality including sign out'
}: ButtonUserMenuProps): JSX.Element {
  useInitializeAccessStore();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [cypressLogin, setCypressLogin] = React.useState('');
  const openMenu = Boolean(anchorEl);
  const { t } = useScopedTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const buttonWrapperRef = React.useRef<HTMLDivElement>(null);
  const loginButtonRef = React.useRef<HTMLDivElement>(null);
  const { updateAppContent2 } = storageObject.useStore();
  const { instance, accounts } = useMsal();
  const { notifyError } = useNotify();
  const [displayName, setDisplayName] = React.useState<string>(accounts[0]?.name ?? '');

  React.useEffect(() => {
    const account = accounts[0];
    if (!account) { setDisplayName(''); return; }
    if (account.idToken) {
      getUserInfo(account.idToken).then((info: { displayName?: string } | null) =>
        setDisplayName(info?.displayName ?? account.name ?? '')
      );
    } else {
      setDisplayName(account.name ?? '');
    }
  }, [accounts]);

  React.useEffect(() => {
    const callbackId = instance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_FAILURE && event.error) {
        notifyError(`Login failed (${event.error.errorCode}): ${event.error.message}`);
      }
      if (event.eventType === EventType.ACQUIRE_TOKEN_FAILURE && event.error) {
        console.warn('[MSAL] ACQUIRE_TOKEN_FAILURE', event.error.errorCode, event.error.message);
      }
    });
    return () => {
      if (callbackId) instance.removeEventCallback(callbackId);
    };
  }, [instance]);

  const username = displayName + cypressLogin;

  React.useEffect(() => {
    const accountStr = localStorage.getItem('cypress:account');
    const account = accountStr ? JSON.parse(accountStr) : null;
    if (account && isCypress) {
      setCypressLogin(account.name);
    }
  }, []);

  // Attach click listener to ButtonLogin
  React.useEffect(() => {
    const loginButton = loginButtonRef.current?.querySelector('button');
    if (loginButton) {
      const handleLoginClick = () => {
        navigate(PATH[0]); // Navigate to home page
      };
      loginButton.addEventListener('click', handleLoginClick);
      return () => {
        loginButton.removeEventListener('click', handleLoginClick);
      };
    }
  }, []);

  const handleMenuOpen = () => {
    if (onClick) {
      onClick();
    } else {
      setAnchorEl(buttonWrapperRef.current);
    }
  };

  const onMenuSelect = (thePath: string) => {
    updateAppContent2([]);
    navigate(thePath);
    setAnchorEl(null);
  };

  return (
    <>
      <Box ref={buttonWrapperRef}>
        {!username && (
          <Box ref={loginButtonRef}>
            <ButtonLogin
              colorBG={theme.palette.secondary.main}
              colorFG={theme.palette.secondary.contrastText}
              loginRequest={buildLoginRequest()}
            />
          </Box>
        )}
        {username && (
          <ButtonUser
            aria-controls={openMenu ? 'user-menu' : undefined}
            aria-description={ariaDescription}
            aria-expanded={openMenu ? 'true' : undefined}
            aria-haspopup="true"
            aria-label={label}
            colorBG={theme.palette.primary.main}
            colorFG={theme.palette.primary.contrastText}
            label={username}
            onClick={handleMenuOpen}
            showPhoto={!getUseIndigo()}
            showUsername
            testId="usernameMenu"
            toolTip={toolTip}
            variant={ButtonVariantTypes.Text}
          />
        )}
      </Box>

      <Menu id="user-menu" anchorEl={anchorEl} open={openMenu} onClose={() => setAnchorEl(null)}>
        {isReviewerAdmin() && (
          <MenuItem data-testid="menuItemOverview" onClick={() => onMenuSelect(PMT[2])}>
            {t('overview.title')}
          </MenuItem>
        )}
        <MenuItem data-testid="menuItemProposals" onClick={() => onMenuSelect(PATH[0])}>
          {t('homeBtn.title')}
        </MenuItem>
        {isReviewerAdmin() && (
          <MenuItem data-testid="menuItemPanelSummary" onClick={() => onMenuSelect(PMT[0])}>
            {t('page.' + PAGE_PANEL_MANAGEMENT + '.title')}
          </MenuItem>
        )}
        {(isReviewer() || isReviewerAdmin()) && (
          <MenuItem data-testid="menuItemReviews" onClick={() => onMenuSelect(PMT[1])}>
            {t('reviewProposalList.short')}
          </MenuItem>
        )}
        {isReviewerChair() && (
          <MenuItem data-testid="menuItemReviewDecisions" onClick={() => onMenuSelect(PMT[4])}>
            {t('reviewDecisionsList.title')}
          </MenuItem>
        )}
        {(isReviewerChair() || isReviewerAdmin() || isReviewer()) && <Divider component="li" />}
        <MenuItem data-testid="menuItemPanelLogout">
          <ButtonLogout
            isText
            variant={ButtonVariantTypes.Outlined}
            colorBG={theme.palette.primary.main}
            colorFG={theme.palette.primary.contrastText}
          />
        </MenuItem>
      </Menu>
    </>
  );
}
