import React from 'react';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Grid2, Paper } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { DUMMY_PROPOSAL_ID, LAST_PAGE, NAV, PROPOSAL_STATUS } from '@utils/constants.ts';
import NextPageButton from '../../button/NextPage/NextPage';
import PreviousPageButton from '../../button/PreviousPage/PreviousPage';
import Proposal from '../../../utils/types/proposal';
import Notification from '../../../utils/types/notification';
import PostProposal from '../../../services/axios/postProposal/postProposal';
import TimedAlert from '../../alerts/timedAlert/TimedAlert';
import ObservatoryData from '@/utils/types/observatoryData';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import { useNotify } from '@/utils/notify/useNotify';
import ProposalAccess from '@/utils/types/proposalAccess';
import {
  PROPOSAL_ACCESS_SUBMIT,
  PROPOSAL_ACCESS_UPDATE,
  PROPOSAL_ACCESS_VIEW,
  PROPOSAL_ROLE_PI
} from '@/utils/aaa/aaaUtils';

interface PageFooterPPTProps {
  pageNo: number;
  buttonDisabled?: boolean;
}

export default function PageFooterPPT({ pageNo, buttonDisabled = false }: PageFooterPPTProps) {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const { application, updateAppContent2, updateAppContent4 } = storageObject.useStore();
  const [usedPageNo, setUsedPageNo] = React.useState(pageNo);
  const authClient = useAxiosAuthClient();
  const { notifyError, notifySuccess, notifyWarning } = useNotify();
  const loggedIn = isLoggedIn();

  const isDisableEndpoints = () => {
    return !loggedIn && !window.Cypress;
  };
  const getObservatoryData = () => application.content3 as ObservatoryData;
  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  React.useEffect(() => {
    const getProposal = () => application.content2 as Proposal;
    if (!getProposal() || getProposal().id === null) {
      setUsedPageNo(-1);
    }
  }, []);

  const createProposal = async () => {
    if (!isDisableEndpoints()) {
      notifyWarning(t('addProposal.warning'));
      const response = await PostProposal(
        authClient,
        {
          ...getProposal(),
          cycle: getObservatoryData()?.observatoryPolicy?.cycleInformation?.cycleId
        },
        PROPOSAL_STATUS.DRAFT
      );

      if (response && !response.error) {
        notifySuccess(t('addProposal.success') + response);
        setProposal({
          ...getProposal(),
          id: response,
          cycle: getObservatoryData()?.observatoryPolicy?.cycleInformation?.cycleId
        });
        // Create a new access entry for the PI.  Saves doing the endpoint
        const newAcc: ProposalAccess = {
          prslId: response,
          role: PROPOSAL_ROLE_PI,
          permissions: [PROPOSAL_ACCESS_VIEW, PROPOSAL_ACCESS_UPDATE, PROPOSAL_ACCESS_SUBMIT]
        };

        const acc = Array.isArray(application.content4)
          ? (application.content4 as ProposalAccess[])
          : [];

        updateAppContent4([...acc, newAcc]);

        navigate(NAV[1]);
      } else {
        notifyError(response.error);
      }
    } else {
      const dummyId = DUMMY_PROPOSAL_ID;
      notifySuccess(t('addProposal.success') + dummyId);
      setProposal({
        ...getProposal(),
        id: dummyId,
        cycle: getObservatoryData()?.observatoryPolicy?.cycleInformation?.cycleId
      });
      navigate(NAV[1]);
    }
  };

  const nextLabel = () => {
    if (usedPageNo === -2) {
      return `addBtn.label`;
    }
    if (usedPageNo === -1) {
      return `createBtn.label`;
    }
    return `page.${usedPageNo + 1}.title`;
  };

  const prevLabel = () => `page.${usedPageNo - 1}.title`;

  const prevPageNav = () => (usedPageNo > 0 ? navigate(NAV[usedPageNo - 1]) : '');

  const nextPageNav = () => (usedPageNo < NAV.length ? navigate(NAV[usedPageNo + 1]) : '');

  const nextPageClicked = () => {
    if (usedPageNo === -1) {
      createProposal();
    } else {
      nextPageNav();
    }
  };

  return (
    <Paper sx={{ position: 'fixed', bottom: 40, left: 0, right: 0 }} elevation={0}>
      <Grid2 p={4} container direction="row" alignItems="flex-end" justifyContent="space-between">
        <Grid2>
          {usedPageNo > 0 && (
            <PreviousPageButton
              action={prevPageNav}
              testId="prevButtonTestId"
              title={prevLabel()}
            />
          )}
        </Grid2>
        <Grid2>
          {(application.content5 as Notification)?.message?.length > 0 && (
            <TimedAlert
              color={(application.content5 as Notification)?.level}
              delay={(application.content5 as Notification)?.delay}
              testId="timeAlertFooter"
              text={(application.content5 as Notification)?.message}
            />
          )}
        </Grid2>
        <Grid2>
          {usedPageNo < LAST_PAGE - 1 && (
            <NextPageButton
              disabled={buttonDisabled}
              testId="nextButtonTestId"
              title={nextLabel()}
              page={usedPageNo}
              primary
              action={nextPageClicked}
            />
          )}
        </Grid2>
      </Grid2>
    </Paper>
  );
}
