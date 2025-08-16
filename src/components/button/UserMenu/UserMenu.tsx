import React from 'react';
import { useMsal } from '@azure/msal-react';
import { Box, Divider, Menu, MenuItem } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { ButtonLogin, ButtonLogout } from '@ska-telescope/ska-login-page';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
// import { ButtonLogin } from './LoginButton';
import { PMT, PATH } from '@/utils/constants';
import { isReviewerAdmin, isReviewerChair, isReviewer } from '@/utils/aaa/aaaUtils';

export type Children = JSX.Element | JSX.Element[] | null;

export interface ButtonUserMenuProps {
  ariaDescription?: string;
  color?: typeof ButtonColorTypes;
  children?: Children;
  label?: string;
  logoutStart?: boolean;
  onClick?: Function;
  photo?: undefined | null | string;
  toolTip?: string;
  showPhoto?: boolean;
}

export default function ButtonUserMenu({
  ariaDescription = 'User Button',
  color = ButtonColorTypes.Inherit,
  label = 'Mocked',
  onClick,
  toolTip = 'Additional user functionality including sign out'
}: ButtonUserMenuProps): JSX.Element {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [cypressLogin, setCypressLogin] = React.useState('');
  const openMenu = Boolean(anchorEl);
  const { t } = useTranslation('pht');
  const navigate = useNavigate();

  const { accounts } = useMsal();
  const username = accounts.length > 0 ? accounts[0].name + cypressLogin : cypressLogin;

  React.useEffect(() => {
    const accountStr = localStorage.getItem('cypress:account');
    const account = accountStr ? JSON.parse(accountStr) : null;
    if (account && window.Cypress) {
      setCypressLogin(account.name);
    }
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (onClick) {
      onClick();
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const onMenuSelect = (thePath: string) => {
    navigate(thePath);
    setAnchorEl(null);
  };

  return (
    <>
      <Box>
        {!username && <ButtonLogin />}
        {username && (
          <Button
            icon={<AccountCircleIcon />}
            aria-controls={openMenu ? 'user-menu' : undefined}
            aria-description={ariaDescription}
            aria-expanded={openMenu ? 'true' : undefined}
            aria-haspopup="true"
            aria-label={label}
            color={color}
            label={username}
            onClick={handleMenuOpen}
            showPhoto={true}
            testId="usernameMenu"
            toolTip={toolTip}
            variant={ButtonVariantTypes.Text}
          />
        )}
      </Box>
      <Menu id="user-menu" anchorEl={anchorEl} open={openMenu} onClose={() => setAnchorEl(null)}>
        {isReviewerAdmin() && (
          <MenuItem key={1} data-testid="menuItemOverview" onClick={() => onMenuSelect(PMT[2])}>
            {t('overview.title')}
          </MenuItem>
        )}
        {(isReviewerAdmin() || isReviewer()) && (
          <MenuItem key={2} data-testid="menuItemProposals" onClick={() => onMenuSelect(PATH[0])}>
            {t('homeBtn.title')}
          </MenuItem>
        )}
        {isReviewerAdmin() && (
          <MenuItem key={3} data-testid="menuItemPanelSummary" onClick={() => onMenuSelect(PMT[0])}>
            {t('page.15.title')}
          </MenuItem>
        )}
        {isReviewer() && (
          <MenuItem key={4} data-testid="menuItemReviews" onClick={() => onMenuSelect(PMT[1])}>
            {t('reviewProposalList.title')}
          </MenuItem>
        )}
        {isReviewerChair() && (
          <MenuItem
            key={5}
            data-testid="menuItemReviewDecisions"
            onClick={() => onMenuSelect(PMT[4])}
          >
            {t('reviewDecisionsList.title')}
          </MenuItem>
        )}
        {(isReviewerAdmin() || isReviewer()) && <Divider component="li" />}
        <MenuItem key={-1} data-testid="menuItemPanelLogout">
          <ButtonLogout isText variant={ButtonVariantTypes.Outlined} />
        </MenuItem>
      </Menu>
    </>
  );
}
