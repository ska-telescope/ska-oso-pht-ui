import React from 'react';
import { Menu } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';

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

export function ButtonUserMenu({
  ariaDescription = 'User Button',
  color = ButtonColorTypes.Inherit,
  children,
  label = 'username',
  onClick,
  photo,
  showPhoto = false,
  toolTip = 'Additional user functionality including sign out'
}: ButtonUserMenuProps): JSX.Element {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (onClick) {
      onClick();
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  return (
    <>
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
        label={label}
        onClick={handleMenuOpen}
        testId="usernameMenu"
        toolTip={toolTip}
        variant={ButtonVariantTypes.Contained}
      />
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={openMenu}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}
      >
        {children}
      </Menu>
    </>
  );
}
