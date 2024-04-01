import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { Alert, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import PageBanner from '../../components/layout/pageBanner/PageBanner';
import PageFooter from '../../components/layout/pageFooter/PageFooter';
import TitleContent from '../../components/TitleContent/TitleContent';
import { EMPTY_PROPOSAL, EMPTY_STATUS, NAV } from '../../utils/constants';
import PostProposal from '../../services/axios/postProposal/postProposal';
import Proposal from '../../utils/types/proposal';

const PAGE = 9;

export default function AddProposal() {
  const { t } = useTranslation('pht');
  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [alertText, setAlertText] = React.useState('');
  const [alertTextColor, setAlertTextColor] = React.useState(AlertColorTypes.Warning);

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  React.useEffect(() => {
    updateAppContent1(EMPTY_STATUS);
    updateAppContent2(EMPTY_PROPOSAL);
  }, []);

  const navigate = useNavigate();

  const createProposal = async () => {
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

  const contentValid = () => !(getProposal()?.title?.length > 0 && getProposal()?.proposalType > 0);

  return (
    <Grid container direction="column" alignItems="space-evenly" justifyContent="space-around">
      <Grid item>
        <PageBanner pageNo={PAGE} />
      </Grid>
      <Grid item>
        <TitleContent page={0} />
      </Grid>
      <Grid item>
        <PageFooter pageNo={-1} buttonDisabled={contentValid()} buttonFunc={createProposal}>
          {alertText && (
            <Alert testId="timedAlertId" color={alertTextColor}>
              <Typography>{alertText}</Typography>
            </Alert>
          )}
        </PageFooter>
      </Grid>
    </Grid>
  );
}
