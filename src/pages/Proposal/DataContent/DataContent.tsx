import React from 'react';
import { Grid, Typography } from '@mui/material';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import { STATUS_ERROR, STATUS_OK } from '../../../utils/constants';
import InfoPanel from '../../../components/infoPanel/infoPanel';
import { Help } from '../../../services/types/help';
import { Proposal } from '../../../services/types/proposal';

export const HELP_PIPELINE = {
  title: 'PIPELINE TITLE',
  description: 'PIPELINE DESCRIPTION',
  additional: ''
};

interface DataContentProps {
  help: Help;
  page: number;
  proposal: Proposal;
  setHelp: Function;
  setProposal: Function;
  setStatus: Function;
}

export default function DataContent({
  help,
  page,
  proposal,
  setHelp,
  setProposal,
  setStatus
}: DataContentProps) {
  React.useEffect(() => {
    if (typeof setStatus !== 'function') {
      return;
    }
    const result = [STATUS_ERROR, STATUS_OK];
    const count = proposal.pipeline.length > 0 ? 1 : 0;
    setStatus([page, result[count]]);
  }, [setStatus]);

  const sdpField = () => (
    <Grid container direction="row" alignItems="baseline" justifyContent="flex-start">
      <Grid item>
        <Typography variant="h6" m={2}>
          SDP
        </Typography>
      </Grid>
    </Grid>
  );

  const pipelineField = () => (
    <Grid container direction="row" alignItems="baseline" justifyContent="flex-start">
      <Grid item xs={2}>
        <Typography>Pipeline</Typography>
      </Grid>
      <Grid item xs={10}>
        <TextEntry
          label=""
          testId="pipelineId"
          value={proposal.pipeline}
          setValue={e => setProposal({ ...proposal, pipeline: e })}
          onFocus={() => setHelp(HELP_PIPELINE)}
        />
      </Grid>
    </Grid>
  );

  const srcNetField = () => (
    <Grid container direction="row" alignItems="baseline" justifyContent="flex-start">
      <Grid item>
        <Typography variant="h6" m={2}>
          SRC Net
        </Typography>
      </Grid>
    </Grid>
  );

  return (
    <Grid
      container
      direction="row"
      alignItems="space-evenly"
      justifyContent="space-around"
      spacing={1}
    >
      <Grid item xs={1} />
      <Grid item xs={7}>
        {sdpField()}
        {pipelineField()}
        {srcNetField()}
      </Grid>
      <Grid item xs={3}>
        <InfoPanel title={help.title} description={help.description} additional={help.additional} />
      </Grid>
      <Grid item xs={1} />
    </Grid>
  );
}
