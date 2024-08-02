import React from 'react';
import { Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import PageBanner from '../../components/layout/pageBanner/PageBanner';
import PageFooter from '../../components/layout/pageFooter/PageFooter';
import TitleContent from '../../components/titleContent/TitleContent';
import { EMPTY_STATUS } from '../../utils/constants';
import Proposal, { NEW_PROPOSAL } from '../../utils/types/proposal';

const PAGE = 9;

export default function AddProposal() {
  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;

  React.useEffect(() => {
    updateAppContent1(EMPTY_STATUS);
    updateAppContent2(NEW_PROPOSAL);
  }, []);

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
        <PageFooter pageNo={-1} buttonDisabled={contentValid()} />
      </Grid>
    </Grid>
  );
}
