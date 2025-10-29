import React from 'react';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import { useNavigate } from 'react-router-dom';
import { Grid, Paper } from '@mui/material';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  cypressToken,
  LAST_PAGE,
  NAV,
  PAGE_SRC_NET,
  PROPOSAL_STATUS,
  PAGE_TECHNICAL
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
import { useAppFlow } from '@/utils/appFlow/AppFlowContext';

interface PageFooterPPTProps {
  pageNo: number;
  buttonDisabled?: boolean;
}

export default function PageFooterPPT({ pageNo, buttonDisabled = false }: PageFooterPPTProps) {
  const { t } = useScopedTranslation();
  const navigate = useNavigate();
  const { application, updateAppContent2, updateAppContent4 } = storageObject.useStore();
  const [usedPageNo, setUsedPageNo] = React.useState(pageNo);
  const authClient = useAxiosAuthClient();
  const { notifyError, notifySuccess, notifyWarning } = useNotify();
  const loggedIn = isLoggedIn();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);
  const { osdCycleId } = useOSDAccessors();
  const { isSV } = useAppFlow();

  React.useEffect(() => {
    const getProposal = () => application.content2 as Proposal;
    if (!getProposal() || getProposal().id === null) {
      setUsedPageNo(-1);
    }
  }, []);

  const createProposal = async () => {
    notifyWarning(t('addProposal.warning'));
    const response = await PostProposal(
      authClient,
      {
        ...getProposal(),
        cycle: osdCycleId
      },
      isSV() ? true : false,
      PROPOSAL_STATUS.DRAFT
    );

    if (response && !('error' in response)) {
      notifySuccess(t('addProposal.success') + response.id);
      setProposal({
        ...(response as Proposal)
      });
      // Create a new access entry for the PI.  Saves doing the endpoint
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
  };

  const showPrevNav = () => {
    if ((loggedIn && usedPageNo > 0) || (cypressToken && usedPageNo > 0)) {
      return true;
    } else return !loggedIn && usedPageNo !== 4;
  };

  const showNextNav = () => {
    if ((loggedIn && usedPageNo < LAST_PAGE - 1) || (cypressToken && usedPageNo < LAST_PAGE - 1)) {
      return true;
    } else return !loggedIn && usedPageNo !== PAGE_SRC_NET;
  };

  const nextLabel = () => {
    if (usedPageNo === -2) {
      return `addBtn.label`;
    }
    if (usedPageNo === -1) {
      return `createBtn.label`;
    }
    const thePage = usedPageNo + (isSV() && usedPageNo === PAGE_TECHNICAL - 1 ? 2 : 1);
    return `page.${thePage}.title`;
  };

  const prevLabel = () =>
    !loggedIn && usedPageNo === 4
      ? `page.0.title`
      : `page.${usedPageNo - (isSV() && usedPageNo === PAGE_TECHNICAL + 1 ? 2 : 1)}.title`;

  const prevPageNav = () =>
    !loggedIn && usedPageNo === 4
      ? navigate(NAV[0])
      : usedPageNo > 0
      ? navigate(NAV[usedPageNo - (isSV() && usedPageNo === PAGE_TECHNICAL + 1 ? 2 : 1)])
      : '';

  const nextPageNav = () =>
    !loggedIn && usedPageNo === 5
      ? ''
      : !loggedIn && usedPageNo === 0
      ? navigate(NAV[4])
      : usedPageNo < NAV.length
      ? navigate(NAV[usedPageNo + (isSV() && usedPageNo === PAGE_TECHNICAL - 1 ? 2 : 1)])
      : '';

  const nextPageClicked = () => {
    if (usedPageNo === -1) {
      createProposal();
    } else {
      nextPageNav();
    }
  };

  const showNotification = () => {
    const note = application.content5 as Notification;
    return note?.message?.length > 0 && note?.level === AlertColorTypes.Error;
  };

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
          {showNotification() && (
            <TimedAlert
              color={(application.content5 as Notification)?.level}
              delay={(application.content5 as Notification)?.delay}
              testId="timeAlertFooter"
              text={(application.content5 as Notification)?.message}
            />
          )}
        </Grid>
        <Grid>
          {showNextNav() && (
            <NextPageButton
              disabled={buttonDisabled}
              testId="nextButtonTestId"
              title={nextLabel()}
              page={usedPageNo}
              primary
              action={nextPageClicked}
            />
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
