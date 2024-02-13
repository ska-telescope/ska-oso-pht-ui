import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import PageBanner from '../../components/layout/pageBanner/PageBanner';
import PageFooter from '../../components/layout/pageFooter/PageFooter';
import TitleContent from '../../components/TitleContent/TitleContent';
import { EMPTY_PROPOSAL, NAV } from '../../utils/constants';
import PostProposal from '../../services/axios/postProposal/postProposal';
import mockProposal from '../../services/axios/getProposal/getProposal';
import { Proposal } from '../../services/types/proposal';
import TimedAlert from '../../components/alerts/timedAlert/TimedAlert';
import { env } from '../../env';

const PAGE = 9;

export default function AddProposal() {
  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [axiosCreateError, setAxiosCreateError] = React.useState('');
  const [axiosCreateErrorColor, setAxiosCreateErrorColor] = React.useState(null);
  const [id, setId] = React.useState(null);

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  React.useEffect(() => {
    updateAppContent1([5, 5, 5, 5, 5, 5, 5, 5, 5]);
    updateAppContent2(EMPTY_PROPOSAL);
  }, []);

  const navigate = useNavigate();

  React.useEffect(() => {
    console.log('setProposalId object ', { ...getProposal(), id: id });
    setProposal({ ...getProposal(), id: id });

    setTimeout(() => {
      navigate(env.REACT_APP_SKA_PHT_BASE_URL + NAV[1]);
    }, 1000);
  }, [id]);

  const createProposal = async () => {
    console.log('createProposal before application', application);
    const response = await PostProposal((mockProposal as unknown) as Proposal, 'Draft');
    if (response && !response.error) {
      console.log('response', response);
      console.log('typeof(response)', typeof response);
      console.log('response.data', response.data);
      console.log('typeof(response.data)', typeof response.data);
      setAxiosCreateError(response);
      setAxiosCreateErrorColor(AlertColorTypes.Success);

      setId(response);
      console.log('createProposal inside application', application);
      // wrapped in a set time out so that the user can see the confirmation -> TODO: make this better later
    } else {
      setAxiosCreateError(response.error);
      setAxiosCreateErrorColor(AlertColorTypes.Error);
    }
    console.log('createProposal after application', application);
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
        <PageBanner pageNo={PAGE} />
      </Grid>
      <Grid item>
        <TitleContent page={0} />
      </Grid>
      <Grid item>
        {axiosCreateError ? (
          <TimedAlert color={axiosCreateErrorColor} text={axiosCreateError} />
        ) : null}
        <PageFooter pageNo={-1} buttonDisabled={contentValid()} buttonFunc={createProposal} />
      </Grid>
    </Grid>
  );
}
