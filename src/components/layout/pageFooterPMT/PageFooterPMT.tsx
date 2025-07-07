import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Paper } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import PreviousPageButton from '../../button/PreviousPage/PreviousPage';
import { NAV } from '../../../utils/constants';
import Proposal from '../../../utils/types/proposal';
import Notification from '../../../utils/types/notification';
import TimedAlert from '../../alerts/timedAlert/TimedAlert';

interface PageFooterPMTProps {
  pageNo: number;
  buttonDisabled?: boolean;
  children?: JSX.Element;
}

export default function PageFooterPMT({
  pageNo,
  buttonDisabled = false,
  children
}: PageFooterPMTProps) {
  const navigate = useNavigate();
  const { application, updateAppContent2, updateAppContent5 } = storageObject.useStore();
  const [usedPageNo, setUsedPageNo] = React.useState(pageNo);

  React.useEffect(() => {
    const getProposal = () => application.content2 as Proposal;
    if (!getProposal() || getProposal().id === null) {
      setUsedPageNo(-1);
    }
  }, []);

  /*
  function Notify(str: string, lvl = AlertColorTypes.Info) {
    const rec: Notification = {
      level: lvl,
      message: str,
      okRequired: false
    };
    updateAppContent5(rec);
  }
  */

  /*
  const NotifyError = (str: string) => Notify(str, AlertColorTypes.Error);
  const NotifyOK = (str: string) => Notify(str, AlertColorTypes.Success);
  const NotifyWarning = (str: string) => Notify(str, AlertColorTypes.Warning);
  */

  const prevLabel = () => `page.${usedPageNo - 1}.title`;

  const prevPageNav = () => (usedPageNo > 0 ? navigate(NAV[usedPageNo - 1]) : '');

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
      </Grid>
    </Paper>
  );
}
