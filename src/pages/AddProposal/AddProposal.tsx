import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { Alert, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import PageBanner from '../../components/layout/pageBanner/PageBanner';
import PageFooter from '../../components/layout/pageFooter/PageFooter';
import TitleContent from '../../components/TitleContent/TitleContent';
import { EMPTY_PROPOSAL, PAGES } from '../../utils/constants';
import AddProposalToDB from '../../services/axios/newProposal/newProposal';
import mockProposal from '../../services/axios/getProposal/getProposal';
import { Proposal } from '../../services/types/proposal';

export default function AddProposal() {
  const { application, updateAppContent2 } = storageObject.useStore();
  const [axiosCreateError, setAxiosCreateError] = React.useState('');
  const [axiosCreateErrorColor, setAxiosCreateErrorColor] = React.useState(null);

  const getProposal = () => application.content2 as Proposal;

  React.useEffect(() => {
    updateAppContent2(EMPTY_PROPOSAL);
  }, []);

  const navigate = useNavigate();

  const createProposal = async () => {
    // TODO : Make sure we go to Page 2 of the proposal
    const response = await AddProposalToDB((mockProposal as unknown) as Proposal);
    if (response && !response.error) {
      setAxiosCreateError(`Success: ${response}`);
      setAxiosCreateErrorColor(AlertColorTypes.Success);
      // wrapped in a set time out so that the user can see the confirmation -> TODO: make this better later
      setTimeout(() => {
        navigate('/proposal');
      }, 1000);
    } else {
      setAxiosCreateError(response.error);
      setAxiosCreateErrorColor(AlertColorTypes.Error);
    }
  };

  const contentValid = () =>
    !(
      getProposal()?.title?.length > 0 &&
      getProposal()?.proposalType > 0 &&
      getProposal()?.proposalSubType > 0
    );

  return (
    <Grid container direction="column" alignItems="space-evenly" justifyContent="space-around">
      <Grid item>
        <PageBanner title={PAGES[0]} addPage={0} />
      </Grid>
      <Grid item>
        <TitleContent page={0} setStatus={null} />
      </Grid>
      <Grid item>
        {axiosCreateError ? (
          <Alert testId="alertCreateErrorId" color={axiosCreateErrorColor}>
            <Typography>{axiosCreateError}</Typography>
          </Alert>
        ) : null}
        <PageFooter pageNo={-1} buttonDisabled={contentValid()} buttonFunc={createProposal} />
      </Grid>
    </Grid>
  );
}
