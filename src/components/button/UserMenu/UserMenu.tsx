import React from 'react';
import { useMsal } from '@azure/msal-react';
import { Box, Divider, Menu, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ButtonLogin, ButtonUser, ButtonLogout } from '@ska-telescope/ska-login-page';
import { ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import { useNavigate } from 'react-router-dom';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { PMT, PATH, isCypress } from '@/utils/constants';
import {
  isReviewerAdmin,
  isReviewerChair,
  isReviewer,
  useInitializeAccessStore // ✅ Import the initializer hook
} from '@/utils/aaa/aaaUtils';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

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
  useInitializeAccessStore(); // ✅ Initialize access store at top level

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [cypressLogin, setCypressLogin] = React.useState('');
  const openMenu = Boolean(anchorEl);
  const { t } = useScopedTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const buttonWrapperRef = React.useRef<HTMLDivElement>(null);
  const { updateAppContent2 } = storageObject.useStore();
  const { accounts } = useMsal();
  const username = accounts.length > 0 ? accounts[0].name + cypressLogin : cypressLogin;

  React.useEffect(() => {
    const accountStr = localStorage.getItem('cypress:account');
    const account = accountStr ? JSON.parse(accountStr) : null;
    if (account && isCypress) {
      setCypressLogin(account.name);
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
          <ButtonLogin
            colorBG={theme.palette.secondary.main}
            colorFG={theme.palette.secondary.contrastText}
          />
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
            showPhoto
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
            {t('page.15.title')}
          </MenuItem>
        )}
        {isReviewer() && (
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
