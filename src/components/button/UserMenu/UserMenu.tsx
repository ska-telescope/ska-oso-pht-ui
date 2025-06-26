import React from 'react';
import { useMsal } from '@azure/msal-react';
import { Box, Divider, Menu, MenuItem } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { ButtonLogin, ButtonLogout } from '@ska-telescope/ska-login-page';
import {
  Button,
  ButtonColorTypes,
  ButtonVariantTypes,
  TickBox
} from '@ska-telescope/ska-gui-components';
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
  photo,
  showPhoto = false,
  toolTip = 'Additional user functionality including sign out'
}: ButtonUserMenuProps): JSX.Element {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mockedLogin, setMockedLogin] = React.useState(true);
  const openMenu = Boolean(anchorEl);
  const { t } = useTranslation('pht');
  const navigate = useNavigate();

  const { accounts } = useMsal();
  const username = accounts.length > 0 ? accounts[0].name : '';
  const displayName = mockedLogin ? 'Mocked' : username;

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
      <TickBox
        label="Mock login"
        labelPosition="bottom"
        testId="linkedTickBox"
        checked={mockedLogin}
        onChange={() => setMockedLogin(!mockedLogin)}
      />
      <Box pt={2}>
        {!displayName && <ButtonLogin />}
        {displayName && (
          <Button
            icon={
              showPhoto && photo ? (
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
            label={displayName}
            onClick={handleMenuOpen}
            testId="usernameMenu"
            toolTip={toolTip}
            variant={ButtonVariantTypes.Text}
          />
        )}
      </Box>
      <Menu id="user-menu" anchorEl={anchorEl} open={openMenu} onClose={() => setAnchorEl(null)}>
        <MenuItem data-testid="menuItemOverview" onClick={() => onMenuSelect(PMT[2])}>
          {t('menuOptions.overview')}
        </MenuItem>
        <MenuItem data-testid="menuItemProposals" onClick={() => onMenuSelect(PATH[0])}>
          {t('menuOptions.proposals')}
        </MenuItem>
        <MenuItem data-testid="menuItemVerification" disabled>
          {t('menuOptions.scienceVerification')}
        </MenuItem>
        <MenuItem data-testid="menuItemPanelSummary" onClick={() => onMenuSelect(PMT[0])}>
          {t('menuOptions.panelSummary')}
        </MenuItem>
        <MenuItem data-testid="menuItemReviews" onClick={() => onMenuSelect(PMT[1])}>
          {t('menuOptions.reviews')}
        </MenuItem>
        <MenuItem data-testid="menuItemReviewDecision" onClick={() => onMenuSelect(PMT[4])}>
          {t('menuOptions.reviewDecision')}
        </MenuItem>
        <Divider component="li" />
        <MenuItem data-testid="menuItemPanelLogout">
          {mockedLogin ? 'Logout' : <ButtonLogout isText variant={ButtonVariantTypes.Outlined} />}
        </MenuItem>
      </Menu>
    </>
  );
}
