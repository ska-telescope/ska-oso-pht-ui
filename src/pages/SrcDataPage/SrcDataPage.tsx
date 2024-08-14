import React from 'react';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { validateSRCPage } from '../../utils/proposalValidation';
import { Proposal } from '../../utils/types/proposal';
import Shell from '../../components/layout/Shell/Shell';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import Alert from '../../components/alerts/standardAlert/StandardAlert';
import { Grid } from '@mui/material';

const PAGE = 8;

export default function SrcDataPage() {
  const { application, updateAppContent1 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);

  const getProposal = () => application.content2 as Proposal;

  const getProposalState = () => application.content1 as number[];
  const setTheProposalState = (value: number) => {
    const temp: number[] = [];
    for (let i = 0; i < getProposalState().length; i++) {
      temp.push(PAGE === i ? value : getProposalState()[i]);
    }
    updateAppContent1(temp);
  };

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [getProposal()]);

  React.useEffect(() => {
    setTheProposalState(validateSRCPage());
  }, [validateToggle]);

  return (
    <Shell page={PAGE}>
      <Grid p={1} container direction="row" alignItems="space-evenly" justifyContent="center">
        <Grid item xs={4}>
          <Grid
            p={1}
            container
            direction="column"
            alignItems="space-evenly"
            justifyContent="center"
          >
            <Grid item xs={4}></Grid>
            <Grid item xs={4}>
              <Alert
                color={AlertColorTypes.Info}
                text="This page is a placeholder for future enhancements"
                testId="developmentPanelId"
              />
            </Grid>
            <Grid item xs={4}></Grid>
          </Grid>
        </Grid>
      </Grid>
    </Shell>
  );
}
