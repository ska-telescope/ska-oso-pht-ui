import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid } from '@mui/material';
import PageBanner from '../../components/layout/pageBanner/PageBanner';
import PageFooter from '../../components/layout/pageFooter/PageFooter';
import TitleContent from '../Proposal/TitleContent/TitleContent';
import { EMPTY_PROPOSAL, PAGES } from '../../utils/constants';
import AddProposalToDB from '../../services/axios/addProposalToDB/addProposalToDB';

export default function AddProposal() {

  const [proposal, setProposal] = React.useState(EMPTY_PROPOSAL);

  const navigate = useNavigate();

  const createProposal = () => {
    if (AddProposalToDB(proposal)) {
      // TODO : Make sure we go to Page 2 of the proposal
      navigate('/proposal');
    } else {
      console.error("FAILED TO ADD THE PROPOSAL");
    }
  };

  const contentValid = () => !(proposal.title.length > 0 && proposal.proposalType > 0 && proposal.proposalSubType > 0);

  return (
    <Grid container direction="column" alignItems="space-evenly" justifyContent="space-around">
      <Grid item>
        <PageBanner proposalState={null} title={PAGES[0]} addPage={0} />
      </Grid>
      <Grid item>
        <TitleContent page={0} proposal={proposal} setProposal={setProposal} setStatus={null} />
      </Grid>
      <Grid item>
        <PageFooter pageNo={-1} buttonDisabled={contentValid()} buttonFunc={createProposal} />
      </Grid>
    </Grid>
  );
}
