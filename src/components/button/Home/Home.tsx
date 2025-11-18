import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import React from 'react';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import { isCypress, PATH } from '@utils/constants.ts';
import BaseButton from '../Base/Button';
import AlertDialog from '../../alerts/alertDialog/AlertDialog';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

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
  const { t } = useScopedTranslation();
  const loggedIn = isLoggedIn();

  const isShowWarningWhenClicked = () => {
    /* c8 ignore start */
    const noLoginTest = window.localStorage.getItem('proposal:noLogin') === 'true';
    if (noLoginTest) {
      return true;
    }
    /* c8 ignore end */

    return !isCypress && !loggedIn;
  };

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
        title={'homeBtn.warningNotLoggedIn.title'}
      >
        <>{t('homeBtn.warningNotLoggedIn.message')}</>
      </AlertDialog>
    </>
  );
}
