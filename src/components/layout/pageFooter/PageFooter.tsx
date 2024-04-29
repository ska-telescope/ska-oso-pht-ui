import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Grid, Paper, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { Alert, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import NextPageButton from '../../button/NextPage/NextPageButton';
import PreviousPageButton from '../../button/PreviousPage/PreviousPageButton';
import { LAST_PAGE, NAV } from '../../../utils/constants';
import Proposal from '../../../utils/types/proposal';
import PostProposal from '../../../services/axios/postProposal/postProposal';

interface PageFooterProps {
  pageNo: number;
  buttonDisabled?: boolean;
  children?: JSX.Element;
}

export default function PageFooter({ pageNo, buttonDisabled = false, children }: PageFooterProps) {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const { application, updateAppContent2 } = storageObject.useStore();
  const [usedPageNo, setUsedPageNo] = React.useState(pageNo);
  const [alertText, setAlertText] = React.useState('');
  const [alertTextColor, setAlertTextColor] = React.useState(AlertColorTypes.Warning);

  React.useEffect(() => {
    const getProposal = () => application.content2 as Proposal;
    if (!getProposal() || getProposal().id === null) {
      setUsedPageNo(-1);
    }
  }, []);

  const createProposal = async () => {
    const getProposal = () => application.content2 as Proposal;
    const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

    setAlertText(t('addProposal.warning'));
    const response = await PostProposal(getProposal(), 'draft');
    if (response && !response.error) {
      setAlertText(t('addProposal.success') + response);
      setAlertTextColor(AlertColorTypes.Success);
      setProposal({ ...getProposal(), id: response });
      setTimeout(() => {
        navigate(NAV[1]);
      }, 2000);
    } else {
      setAlertText(response.error);
      setAlertTextColor(AlertColorTypes.Error);
    }
  };

  const nextLabel = () => {
    if (usedPageNo === -2) {
      return t(`button.add`);
    }
    if (usedPageNo === -1) {
      return t(`button.create`);
    }
    return t(`page.${usedPageNo + 1}.title`);
  };

  const prevLabel = () => t(`page.${usedPageNo - 1}.title`);

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
    <Paper
      sx={{ bgcolor: 'transparent', position: 'fixed', bottom: 40, left: 0, right: 0 }}
      elevation={0}
    >
      <Grid p={1} container direction="row" alignItems="flex-end" justifyContent="space-between">
        <Grid item>
          {usedPageNo > 0 && (
            <PreviousPageButton label={prevLabel()} page={usedPageNo} func={prevPageNav} />
          )}
        </Grid>
        <Grid item>
          {alertText && (
            <Alert testId="timedAlertId" color={alertTextColor}>
              <Typography>{alertText}</Typography>
            </Alert>
          )}
        </Grid>
        <Grid item>
          {usedPageNo < LAST_PAGE - 1 && (
            <NextPageButton
              disabled={buttonDisabled}
              label={nextLabel()}
              page={usedPageNo}
              func={nextPageClicked}
            />
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
