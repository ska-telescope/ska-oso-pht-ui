import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMsal } from '@azure/msal-react';
import HomeIcon from '@mui/icons-material/Home';
import React from 'react';
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
  toolTip = 'homeBtn.tooltip',
}: HomeButtonProps) {
  const [openWarningDialog, setOpenWarningDialog] = React.useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation('pht');

  const { isMockedLoggedIn } = useMockedLogin();

  const { accounts } = useMsal();
  const isLoggedIn = () => accounts.length > 0;

  const isShowWarningWhenClicked = () => !isLoggedIn() && !isMockedLoggedIn;

  const ClickFunction = () => {
    if (isShowWarningWhenClicked()) {
      setOpenWarningDialog(true);
    } else navigatetoLandingPage();
  };

  const navigatetoLandingPage = () => {
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
        onDialogResponse={navigatetoLandingPage}
      >
        {t('homeBtn.warningNotLoggedIn')}
      </AlertDialog>
    </>
  );
}
