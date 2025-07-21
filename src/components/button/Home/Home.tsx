import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomeIcon from '@mui/icons-material/Home';
import React from 'react';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import BaseButton from '../Base/Button';
import { PATH } from '../../../utils/constants';
import AlertDialog from '../../alerts/alertDialog/AlertDialog';
import { useMockedLogin } from '@/contexts/MockedLoginContext';

interface HomeButtonProps {
  title?: string;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
}

export default function HomeButton({
  disabled = false,
  title = 'homeBtn.label',
  primary = false,
  testId = 'homeButtonTestId',
  toolTip = 'homeBtn.tooltip'
}: HomeButtonProps) {
  const [openWarningDialog, setOpenWarningDialog] = React.useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation('pht');
  const loggedIn = isLoggedIn();

  const { isMockedLoggedIn } = useMockedLogin();

  const isShowWarningWhenClicked = () => !loggedIn && !isMockedLoggedIn;

  const ClickFunction = () => {
    if (isShowWarningWhenClicked()) {
      setOpenWarningDialog(true);
    } else navigateToLandingPage();
  };

  const navigateToLandingPage = () => {
    navigate(PATH[0]);
  };

  const closeDialog = () => {
    setOpenWarningDialog(false);
  };

  return (
    <>
      <BaseButton
        action={ClickFunction}
        disabled={disabled}
        icon={<HomeIcon />}
        primary={primary}
        testId={testId}
        title={title}
        toolTip={toolTip}
      />
      <AlertDialog
        open={openWarningDialog}
        onClose={closeDialog}
        onDialogResponse={navigateToLandingPage}
        title={t('homeBtn.warningNotLoggedIn.title')}
      >
        {t('homeBtn.warningNotLoggedIn.message')}
      </AlertDialog>
    </>
  );
}
