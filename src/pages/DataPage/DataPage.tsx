import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import { STATUS_ERROR, STATUS_OK } from '../../utils/constants';
import { Proposal } from '../../services/types/proposal';
import Shell from '../../components/layout/Shell/Shell';

import HelpPanel from '../../components/helpPanel/helpPanel';

const PAGE = 7;

export default function DataPage() {
  const { t } = useTranslation('pht');

  const {
    application,
    helpComponent,
    updateAppContent1,
    updateAppContent2
  } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const getProposalState = () => application.content1 as number[];
  const setTheProposalState = (value: number) => {
    const temp = [];
    for (let i = 0; i < getProposalState().length; i++) {
      temp.push(PAGE === i ? value : getProposalState()[i]);
    }
    updateAppContent1(temp);
  };

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
    helpComponent(t("help.pipeline"));
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [getProposal()]);

  React.useEffect(() => {
    const result = [STATUS_ERROR, STATUS_OK];
    const count = getProposal().pipeline.length > 0 ? 1 : 0;
    setTheProposalState(result[count]);
  }, [validateToggle]);

  const pipelineField = () => (
    <Grid container direction="row" alignItems="baseline" justifyContent="flex-start">
      <Grid mt={2} item xs={2}>
        <Typography>{t('label.pipeline')}</Typography>
      </Grid>
      <Grid item xs={10}>
        <TextEntry
          label=""
          testId="pipelineId"
          value={getProposal().pipeline}
          setValue={(e: string) => setProposal({ ...getProposal(), pipeline: e.substring(0, 100) })}
          onFocus={() => helpComponent(t('help.pipeline'))}
          helperText="Please enter your pipeline information"
        />
      </Grid>
    </Grid>
  );

  return (
    <Shell page={PAGE}>
      <Grid
        spacing={1}
        p={3}
        container
        direction="row"
        alignItems="space-evenly"
        justifyContent="space-around"
      >
        <Grid item xs={1} />
        <Grid
          container
          spacing={1}
          direction="row"
          alignItems="baseline"
          justifyContent="flex-start"
        >
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
    </Shell>
  );
}
