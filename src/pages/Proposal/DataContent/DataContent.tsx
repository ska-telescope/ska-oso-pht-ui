import React from 'react';
import { Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import { STATUS_ERROR, STATUS_OK } from '../../../utils/constants';
import { Proposal } from '../../../services/types/proposal';
import HelpPanel from '../../../components/helpPanel/helpPanel';

export const HELP_PIPELINE = ['PIPELINE TITLE','PIPELINE DESCRIPTION','' ];

interface DataContentProps {
  page: number;
  setStatus: Function;
}

export default function DataContent({ page, setStatus }: DataContentProps) {
  const { application, helpComponent } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [pipeline, setPipeline] = React.useState('');

  const getProposal = () => application.content2 as Proposal;

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
    helpComponent(HELP_PIPELINE);
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [getProposal()]);

  React.useEffect(() => {
    if (typeof setStatus !== 'function') {
      return;
    }
    const result = [STATUS_ERROR, STATUS_OK];
    const count = getProposal().pipeline.length > 0 ? 1 : 0;
    setStatus([page, result[count]]);
  }, [validateToggle]);

  const pipelineField = () => (
    <Grid container direction="row" alignItems="baseline" justifyContent="flex-start">
      <Grid mt={2} item xs={2}>
        <Typography>Pipeline</Typography>
      </Grid>
      <Grid item xs={10}>
        <TextEntry
          label=""
          testId="pipelineId"
          value={pipeline}
          setValue={setPipeline}
          onFocus={() => helpComponent(HELP_PIPELINE)}
          helperText="Please enter your pipeline information"
        />
      </Grid>
    </Grid>
  );

  return (
    <Grid
      spacing={1}
      p={3}
      container
      direction="row"
      alignItems="space-evenly"
      justifyContent="space-around"
    >
      <Grid item xs={1} />
      <Grid container spacing={1} direction="row" alignItems="baseline" justifyContent="flex-start">
        <Grid item xs={7}>
          <Typography variant="h6" m={2}>
            SDP
          </Typography>

          {pipelineField()}
          <Typography variant="h6" m={2}>
            SRC Net
          </Typography>

        </Grid>
        <Grid item xs={1} />
        <Grid item xs={3}>
          <HelpPanel />
        </Grid>
      </Grid>
    </Grid>
  );
}
