import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid } from '@mui/material';
import PageBanner from '../../components/layout/pageBanner/PageBanner';
import PageFooter from '../../components/layout/pageFooter/PageFooter';
import TitleContent from '../Proposal/TitleContent/TitleContent';
import { PAGES } from '../../utils/constants';

export default function AddProposal() {
  const EMPTY_PROPOSAL = {
    id: null,
    title: '',
    proposalType: 0,
    proposalSubType: 0
  };

  const [proposal, setProposal] = React.useState(EMPTY_PROPOSAL);

  const navigate = useNavigate();

  const createProposal = () => {
    // TODO : We need to call putProposal here.

    navigate('/proposal');
  };

  return (
    <Grid container direction="column" alignItems="space-evenly" justifyContent="space-around">
      <Grid item>
        <PageBanner proposalState={null} title={PAGES[0]} addPage={0} />
      </Grid>
      <Grid item>
        <TitleContent page={0} theProposal={proposal} setProposal={setProposal} setStatus={null} />
      </Grid>
      <Grid item>
        <PageFooter pageNo={-1} buttonFunc={createProposal} />
      </Grid>
    </Grid>
  );
}
