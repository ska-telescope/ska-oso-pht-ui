import React from 'react';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import { useNavigate } from 'react-router-dom';
import { Grid, Paper } from '@mui/material';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  cypressToken,
  NAV,
  PROPOSAL_STATUS,
  PAGE_TITLE_ADD,
  PAGE_TARGET,
  PAGE_OBSERVATION,
  STATUS_ARRAY_PAGES_PROPOSAL,
  STATUS_ARRAY_PAGES_SV
} from '@utils/constants.ts';
import PostProposal from '@services/axios/post/postProposal/postProposal';
import NextPageButton from '../../button/NextPage/NextPage';
import PreviousPageButton from '../../button/PreviousPage/PreviousPage';
import Proposal from '../../../utils/types/proposal';
import Notification from '../../../utils/types/notification';
import TimedAlert from '../../alerts/timedAlert/TimedAlert';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import { useNotify } from '@/utils/notify/useNotify';
import ProposalAccess from '@/utils/types/proposalAccess';
import { PROPOSAL_ACCESS_PERMISSIONS, PROPOSAL_ROLE_PI } from '@/utils/aaa/aaaUtils';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { validateProposalNavigation } from '@/utils/validation/validation';

interface PageFooterPPTProps {
  pageNo: number;
  buttonDisabled?: boolean;
}

export default function PageFooterPPT({ pageNo, buttonDisabled = false }: PageFooterPPTProps) {
  const { t } = useScopedTranslation();
  const navigate = useNavigate();
  const { application, updateAppContent2, updateAppContent4 } = storageObject.useStore();
  const authClient = useAxiosAuthClient();
  const { notifyClear, notifyError, notifySuccess, notifyWarning } = useNotify();
  const loggedIn = isLoggedIn();
  const { isSV, osdCycleId, osdCyclePolicy } = useOSDAccessors();

  const proposal = application.content2 as Proposal;
  const notification = application.content5 as Notification;

  const pages = React.useMemo(() => (isSV ? STATUS_ARRAY_PAGES_SV : STATUS_ARRAY_PAGES_PROPOSAL), [
    isSV
  ]);

  const currPageNo = proposal?.id == null && !cypressToken ? -1 : pageNo;

  const { prevPageNo, nextPageNo } = React.useMemo(() => {
    const idx = pages.findIndex(p => p === currPageNo);
    return {
      prevPageNo: idx > 0 ? pages[idx - 1] : -2,
      nextPageNo: idx >= 0 && idx < pages.length - 1 ? pages[idx + 1] : -2
    };
  }, [currPageNo, pages]);

  const createProposal = React.useCallback(async () => {
    notifyWarning(t('addProposal.warning'));

    const response = await PostProposal(
      authClient,
      { ...proposal, cycle: osdCycleId ?? null },
      isSV,
      PROPOSAL_STATUS.DRAFT
    );

    if (response && !('error' in response)) {
      notifySuccess(t('addProposal.success') + response.id);
      updateAppContent2(response as Proposal);

      const newAcc: Partial<ProposalAccess> = {
        prslId: response.id,
        role: PROPOSAL_ROLE_PI,
        permissions: PROPOSAL_ACCESS_PERMISSIONS
      };

      const acc = Array.isArray(application.content4)
        ? (application.content4 as ProposalAccess[])
        : [];

      updateAppContent4([...acc, newAcc]);
      navigate(NAV[1]);
    } else {
      notifyError((response as { error: string }).error);
    }
  }, [
    proposal,
    osdCycleId,
    isSV,
    authClient,
    notifyWarning,
    notifySuccess,
    notifyError,
    updateAppContent2,
    updateAppContent4,
    application.content4,
    navigate,
    t
  ]);

  const nextPageInvalid = !validateProposalNavigation(
    proposal,
    nextPageNo,
    isSV && osdCyclePolicy?.maxTargets === 1 && osdCyclePolicy?.maxObservations === 1
  );

  const showPrevNav = () => {
    if ((loggedIn && currPageNo > 0) || (cypressToken && currPageNo > 0)) {
      return true;
    }
    return !loggedIn && !cypressToken && currPageNo !== PAGE_TARGET;
  };

  const showNextNav = () => {
    return (
      (!loggedIn && currPageNo === PAGE_TARGET) ||
      ((loggedIn || cypressToken) && (currPageNo === -1 || nextPageNo !== -2))
    );
  };

  const nextLabel = React.useCallback(() => {
    if (currPageNo === -2) return 'addBtn.label';
    if (currPageNo === -1) return 'createBtn.label';
    return `page.${nextPageNo}.title`;
  }, [currPageNo, nextPageNo]);

  const prevLabel = React.useCallback(() => {
    if (!loggedIn && currPageNo === 4) {
      return `page.${PAGE_TITLE_ADD}.title`;
    }
    return `page.${prevPageNo}.title`;
  }, [currPageNo, prevPageNo, loggedIn]);

  const prevPageNav = React.useCallback(() => {
    if (!loggedIn && currPageNo === PAGE_TARGET) {
      navigate(NAV[0]);
    } else if (prevPageNo > -1) {
      navigate(NAV[prevPageNo]);
    }
  }, [currPageNo, prevPageNo, loggedIn, navigate]);

  const nextPageNav = React.useCallback(() => {
    if (!loggedIn && currPageNo === PAGE_OBSERVATION) return;
    if (!loggedIn && currPageNo === 0) {
      navigate(NAV[PAGE_TARGET]);
      return;
    }

    if (nextPageInvalid) {
      notifyError(t('scienceCategory.validationNavigationError'));
      setTimeout(() => {
        notifyClear();
      }, 4000);
    }

    if (!nextPageInvalid && nextPageNo < NAV.length) {
      navigate(NAV[nextPageNo]);
    }
  }, [
    currPageNo,
    nextPageNo,
    loggedIn,
    navigate,
    proposal,
    osdCyclePolicy?.maxTargets,
    osdCyclePolicy?.maxObservations
  ]);

  const nextPageClicked = () => {
    if (currPageNo === -1) createProposal();
    else nextPageNav();
  };

  const showNotification =
    notification?.message?.length > 0 && notification?.level === AlertColorTypes.Error;

  return (
    <Paper
      sx={{ backgroundColor: 'transparent', position: 'fixed', bottom: 40, left: 0, right: 0 }}
      elevation={0}
    >
      <Grid
        p={4}
        pt={0}
        container
        direction="row"
        alignItems="flex-end"
        justifyContent="space-between"
      >
        <Grid>
          {showPrevNav() && (
            <PreviousPageButton
              action={prevPageNav}
              testId="prevButtonTestId"
              title={prevLabel()}
            />
          )}
        </Grid>

        <Grid>
          {showNotification && (
            <TimedAlert
              color={notification.level}
              delay={notification.delay}
              testId="timeAlertFooter"
              text={notification.message}
            />
          )}
        </Grid>

        <Grid>
          {showNextNav() && (
            <NextPageButton
              disabled={buttonDisabled}
              testId="nextButtonTestId"
              title={nextLabel()}
              page={currPageNo}
              primary
              action={nextPageClicked}
            />
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
