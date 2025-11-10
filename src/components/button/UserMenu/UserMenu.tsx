import React from 'react';
import { useMsal } from '@azure/msal-react';
import {
  Box,
  Divider,
  Drawer,
  Menu,
  MenuItem,
  Stack,
  Grid,
  Button,
  Popper,
  Typography,
  Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ButtonLogin, ButtonUser, ButtonLogout } from '@ska-telescope/ska-login-page';
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
import EdgeSlider from '@/components/layout/EdgeSlider/EdgeSlider';

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
  const [openHelpDrawer, setOpenHelpDrawer] = React.useState(false);
  const [cypressLogin, setCypressLogin] = React.useState('');

  const [anchorElPopper, setAnchorElPopper] = React.useState<null | HTMLElement>(null);
  const [openPopper, setOpenPopper] = React.useState(false);

  const handleClickPopper = (event: any) => {
    setAnchorElPopper(event.currentTarget);
    setOpenPopper(prev => !prev);
  };

  const openMenu = Boolean(anchorEl);
  const { t } = useScopedTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const buttonWrapperRef = React.useRef<HTMLDivElement>(null);
  const loginButtonRef = React.useRef<HTMLDivElement>(null);
  const { updateAppContent2, help } = storageObject.useStore();
  const { accounts } = useMsal();
  const username = accounts.length > 0 ? accounts[0].name + cypressLogin : cypressLogin;

  const getHelp = () => {
    return Object.keys(help.component).length === 0 ? '' : (help.component as string);
  };

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

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpenHelpDrawer(newOpen);
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
            {t('page.' + PAGE_PANEL_MANAGEMENT + '.title')}
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
        <MenuItem onClick={toggleDrawer(true)}>Open Help Text</MenuItem>
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
      <Drawer
        anchor={'right'}
        open={openHelpDrawer}
        onClose={toggleDrawer(false)}
        // variant='permanent'
        // hideBackdrop={true}
        //     ModalProps={{
        //   hideBackdrop: true,
        //   sx: {
        //     // pointerEvents: 'none',
        //   },
        // }}
        // sx={{
        //   '& .MuiDrawer-paper': {
        //     pointerEvents: 'auto',
        //   },
        // }}
      >
        <Box m={1} sx={{ width: 250, minWidth: '25vw' }}>
          <Stack sx={{ height: '95%' }} spacing={5}>
            <Grid container direction="row" justifyContent="space-evenly">
              <Grid>
                <Button variant="contained" onClick={toggleDrawer(false)}>
                  Close
                </Button>
              </Grid>
            </Grid>
            <Grid>{getHelp()}</Grid>
          </Stack>
        </Box>
      </Drawer>

      <Button
        variant="contained"
        color="primary"
        onClick={handleClickPopper}
        sx={{
          position: 'fixed',
          top: '50%',
          right: 10,
          transform: 'translateY(-50%) rotate(-90deg)', // rotate text
          transformOrigin: 'right center', // pivot point for rotation
          borderRadius: '8px 8px 0 0', // optional rounded ends
          zIndex: 1200,
          py: 1.5,
          px: 3
        }}
      >
        HELP
      </Button>
      <Popper open={openPopper} anchorEl={anchorElPopper} placement="left">
        <Paper sx={{ p: 2, boxShadow: 3, maxWidth: 250, minHeight: '80vh' }}>
          <Typography>
            I am helper text I am helper text I am helper text I am helper text I am helper text I
            am helper text I am helper text I am helper text I am helper text I am helper text I am
            helper text I am helper text I am helper text I am helper textI am helper textI am
            helper textI am helper textI am helper textI am helper textI am helper textI am helper
            textI am helper textI am helper textI am helper textI am helper textI am helper textI am
            helper textI am helper text
          </Typography>
        </Paper>
      </Popper>

      <EdgeSlider helperText={getHelp()} />
    </>
  );
}
