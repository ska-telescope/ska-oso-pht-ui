import React from 'react';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { Box, Divider, Menu, MenuItem } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { ButtonLogin, ButtonLogout, getPhoto } from '@ska-telescope/ska-login-page';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PMT, PATH } from '@/utils/constants';

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
  const openMenu = Boolean(anchorEl);
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();

  const { accounts } = useMsal();
  const username = accounts.length > 0 ? accounts[0].name : '';
  const photo = isAuthenticated ? getPhoto() : null;

  // console.log('TREVOR accounts', accounts[0], photo);
  // const permissions = useUserRoles();

  /* TODO : TREVOR : Keep until we can confirm we have all the permissions
  React.useEffect(() => {
    if (accounts) {
      console.log('TREVOR PERMISSIONS', permissions);
    }
  }, [accounts]);
  */

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
            icon={
              photo ? (
                <img
                  src={photo}
                  alt="Profile"
                  style={{ borderRadius: '50%', width: '32px', height: '32px', objectFit: 'cover' }}
                />
              ) : (
                <AccountCircleIcon />
              )
            }
            aria-controls={openMenu ? 'user-menu' : undefined}
            aria-description={ariaDescription}
            aria-expanded={openMenu ? 'true' : undefined}
            aria-haspopup="true"
            aria-label={label}
            color={color}
            label={username}
            onClick={handleMenuOpen}
            testId="usernameMenu"
            toolTip={toolTip}
            variant={ButtonVariantTypes.Text}
          />
        )}
      </Box>
      <Menu id="user-menu" anchorEl={anchorEl} open={openMenu} onClose={() => setAnchorEl(null)}>
        <MenuItem key={1} data-testid="menuItemOverview" onClick={() => onMenuSelect(PMT[2])}>
          {t('overview.title')}
        </MenuItem>
        <MenuItem key={2} data-testid="menuItemProposals" onClick={() => onMenuSelect(PATH[0])}>
          {t('homeBtn.title')}
        </MenuItem>
        <MenuItem key={3} data-testid="menuItemPanelSummary" onClick={() => onMenuSelect(PMT[0])}>
          {t('page.15.title')}
        </MenuItem>
        <MenuItem key={4} data-testid="menuItemReviews" onClick={() => onMenuSelect(PMT[1])}>
          {t('reviewProposalList.title')}
        </MenuItem>
        <MenuItem
          key={5}
          data-testid="menuItemReviewDecisions"
          onClick={() => onMenuSelect(PMT[4])}
        >
          {t('reviewDecisionsList.title')}
        </MenuItem>
        <Divider component="li" />
        <MenuItem key={-1} data-testid="menuItemPanelLogout">
          <ButtonLogout isText variant={ButtonVariantTypes.Outlined} />
        </MenuItem>
      </Menu>
    </>
  );
}
