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
import { Proposal } from '../../services/types/proposal';
import TimedAlert from '../../components/alerts/timedAlert/TimedAlert';

const PAGE = 9;

export default function AddProposal() {
  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [axiosCreateError, setAxiosCreateError] = React.useState('');
  const [axiosCreateErrorColor, setAxiosCreateErrorColor] = React.useState(null);

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  React.useEffect(() => {
    updateAppContent1([5, 5, 5, 5, 5, 5, 5, 5, 5]);
    updateAppContent2(EMPTY_PROPOSAL);
  }, []);

  const navigate = useNavigate();

  const createProposal = async () => {
    const response = await PostProposal(getProposal(), 'Draft');
    if (response && !response.error) {
      setAxiosCreateError(response);
      setAxiosCreateErrorColor(AlertColorTypes.Success);
      setTimeout(() => {
        setProposal({ ...getProposal(), id: response });
        navigate(NAV[1]);
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
