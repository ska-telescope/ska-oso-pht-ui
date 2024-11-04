import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Grid, Paper } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import NextPageButton from '../../button/NextPage/NextPage';
import PreviousPageButton from '../../button/PreviousPage/PreviousPage';
import { LAST_PAGE, NAV, PROPOSAL_STATUS } from '../../../utils/constants';
import Proposal from '../../../utils/types/proposal';
import Notification from '../../../utils/types/notification';
import PostProposal from '../../../services/axios/postProposal/postProposal';
import TimedAlert from '../../../components/alerts/timedAlert/TimedAlert';

interface PageFooterProps {
  pageNo: number;
  buttonDisabled?: boolean;
  children?: JSX.Element;
}

export default function PageFooter({ pageNo, buttonDisabled = false, children }: PageFooterProps) {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const { application, updateAppContent2, updateAppContent5 } = storageObject.useStore();
  const [usedPageNo, setUsedPageNo] = React.useState(pageNo);

  React.useEffect(() => {
    const getProposal = () => application.content2 as Proposal;
    if (!getProposal() || getProposal().id === null) {
      setUsedPageNo(-1);
    }
  }, []);

  function Notify(str: string, lvl: AlertColorTypes = AlertColorTypes.Info) {
    const rec: Notification = {
      level: lvl,
      message: str,
      okRequired: false
    };
    updateAppContent5(rec);
  }
  const NotifyError = (str: string) => Notify(str, AlertColorTypes.Error);
  const NotifyOK = (str: string) => Notify(str, AlertColorTypes.Success);
  const NotifyWarning = (str: string) => Notify(str, AlertColorTypes.Warning);

  const createProposal = async () => {
    const getProposal = () => application.content2 as Proposal;
    const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

    NotifyWarning(t('addProposal.warning'));
    const response = await PostProposal(getProposal(), PROPOSAL_STATUS.DRAFT);
    if (response && !response.error) {
      NotifyOK(t('addProposal.success') + response);
      setProposal({ ...getProposal(), id: response });
      navigate(NAV[1]);
    } else {
      NotifyError(response.error);
    }
  };

  const nextLabel = () => {
    if (usedPageNo === -2) {
      return `button.add`;
    }
    if (usedPageNo === -1) {
      return `button.create`;
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
      <Grid p={4} container direction="row" alignItems="flex-end" justifyContent="space-between">
        <Grid item>
          {usedPageNo > 0 && (
            <PreviousPageButton
              action={prevPageNav}
              testId="prevButtonTestId"
              title={prevLabel()}
            />
          )}
        </Grid>
        <Grid item>
          {(application.content5 as Notification)?.message?.length > 0 && (
            <TimedAlert
              color={(application.content5 as Notification)?.level}
              delay={(application.content5 as Notification)?.delay}
              testId="timeAlertFooter"
              text={(application.content5 as Notification)?.message}
            />
          )}
        </Grid>
        <Grid item>
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
        </Grid>
      </Grid>
    </Paper>
  );
}
