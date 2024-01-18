import React from 'react';
import { Grid, Typography } from '@mui/material';
// import { TextEntry } from '@ska-telescope/ska-gui-components';
import { STATUS_OK } from '../../../utils/constants';
// import InfoPanel from '../../../components/infoPanel/infoPanel';
// import { Help } from '../../../services/types/help';
import { Proposal } from '../../../services/types/proposal';

// TODO : This page needs to have it's contents determined and written up.

export const HELP_PIPELINE = {
  title: 'PIPELINE TITLE',
  description: 'PIPELINE DESCRIPTION',
  additional: ''
};

interface DataContentProps {
  page: number;
  proposal: Proposal;
  setStatus: Function;
}

export default function DataContent({ page, proposal, setStatus }: DataContentProps) {
  const [validateToggle, setValidateToggle] = React.useState(false);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [proposal]);

  React.useEffect(() => {
    if (typeof setStatus !== 'function') {
      return;
    }
    /*
    const result = [STATUS_ERROR, STATUS_OK];
    const count = proposal.pipeline.length > 0 ? 1 : 0;
    setStatus([page, result[count]]);
    */
    setStatus([page, STATUS_OK]);
  }, [validateToggle]);

  return (
    <Grid
      container
      direction="row"
      alignItems="space-evenly"
      justifyContent="space-around"
      spacing={1}
    >
      <Grid item xs={1} />
      <Grid container direction="row" alignItems="baseline" justifyContent="flex-start">
        <Grid item>
          <Typography variant="h6" m={2}>
            CONTENT OF THIS PAGE IS STILL TO BE DETERMINED
          </Typography>
        </Grid>
      </Grid>
      {/* <Grid item xs={7}>
        {sdpField()}
        {pipelineField()}
        {srcNetField()}
      </Grid>
      <Grid item xs={3}>
        <InfoPanel title={help.title} description={help.description} additional={help.additional} />
      </Grid> */}
      <Grid item xs={1} />
    </Grid>
  );
}
