import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid } from '@mui/material';
import PageBanner from '../../components/layout/pageBanner/PageBanner';
import PageFooter from '../../components/layout/pageFooter/PageFooter';
import TitleContent from '../Proposal/TitleContent/TitleContent';
import { PAGES } from '../../utils/constants';

export default function AddProposal() {
  const navigate = useNavigate();

  const createProposal = () => {
    // TODO : We need to call putProposal here.
  
      navigate('/proposal');
  };

  return (
    <Grid container direction="column" alignItems="space-evenly" justifyContent="space-around">
      <Grid item>
        <PageBanner title={PAGES[0].title} addPage={0} />
      </Grid>
      <Grid item>
        <TitleContent />
      </Grid>
      <Grid item>
        <PageFooter pageNo={-1} buttonFunc={createProposal} />
      </Grid>
    </Grid>
  );
}
