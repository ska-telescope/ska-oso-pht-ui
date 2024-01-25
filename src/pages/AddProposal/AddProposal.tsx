import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography } from '@mui/material';
import { Alert, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import PageBanner from '../../components/layout/pageBanner/PageBanner';
import PageFooter from '../../components/layout/pageFooter/PageFooter';
import TitleContent from '../Proposal/TitleContent/TitleContent';
import { EMPTY_PROPOSAL, PAGES } from '../../utils/constants';
import PostProposal from '../../services/axios/postProposal/postProposal';
import mockProposal from '../../services/axios/getProposal/getProposal';
import { Proposal } from '../../services/types/proposal';

export default function AddProposal() {
  const [proposal, setProposal] = React.useState(EMPTY_PROPOSAL);
  const [axiosCreateError, setAxiosCreateError] = React.useState('');
  const [axiosCreateErrorColor, setAxiosCreateErrorColor] = React.useState(null);

  const navigate = useNavigate();

  const createProposal = async () => {
    // TODO : Make sure we go to Page 2 of the proposal
    const response = await PostProposal((mockProposal as unknown) as Proposal);
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
    !(proposal.title.length > 0 && proposal.proposalType > 0 && proposal.proposalSubType > 0);

  return (
    <Grid container direction="column" alignItems="space-evenly" justifyContent="space-around">
      <Grid item>
        <PageBanner proposalState={null} title={PAGES[0]} addPage={0} />
      </Grid>
      <Grid item>
        <TitleContent
          page={0}
          proposal={proposal as Proposal}
          setProposal={setProposal}
          setStatus={null}
        />
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
