import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import { DialogActions, DialogContent, Grid, Typography } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import CancelButton from '../../button/cancel/CancelButton';
import ConfirmButton from '../../button/confirm/ConfirmButton';
import { Proposal } from '../../../services/types/proposal';
import { GENERAL, OBSERVATION, Projects } from '../../../utils/constants';
import TeamMember from '../../../services/types/teamMember';
import Target from '../../../services/types/target';
import Observation from '../../../services/types/observation';

interface SubmitConfirmationProps {
  open: boolean;
  onClose: Function;
  onConfirm: Function;
}

const LABEL_WIDTH = 3;
const LABEL_STYLE = 'subtitle1';
const CONTENT_WIDTH = 12 - LABEL_WIDTH;
const CONTENT_STYLE = 'subtitle2';

export default function SubmitConfirmation({ open, onClose, onConfirm }: SubmitConfirmationProps) {
  const theme = useTheme();
  const { application } = storageObject.useStore();

  const getProposal = () => {
    const p = application.content2 as Proposal;
    return p;
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const proposalType = () => {
    const pt = getProposal().proposalType;
    const pName = !pt || pt < 1 ? 'None selected' : Projects[pt - 1].title;
    const st = getProposal().proposalSubType;
    const sName =
      !pt || pt < 1 || !st || st < 1 ? 'None selected' : Projects[pt - 1].subProjects[st - 1].title;
    return `${pName} / ${sName}`;
  };

  const category = () => {
    const pt = getProposal().category;
    const pName = !pt || pt < 1 ? 'None selected' : GENERAL.ScienceCategory[pt - 1].label;
    const st = getProposal().subCategory;
    const sName =
      !pt || pt < 1 || !st || st < 1
        ? 'None selected'
        : GENERAL.ScienceCategory[pt - 1].subCategory[st - 1].label;
    return `${pName} / ${sName}`;
  };

  const telescope = (tel: number) => OBSERVATION.array[tel].label;
  const subarray = (tel: number, arr: number) => OBSERVATION.array[tel].subarray[arr].label;
  const observationType = (type: number) => OBSERVATION.ObservationType[type].label;

  const pageTitle = (title: string) => (
    <Grid container direction="row" justifyContent="space-around" alignItems="center">
      <Grid item>
        <Typography variant="h4">{`${title} ${GENERAL.Cycle}`}</Typography>
      </Grid>
    </Grid>
  );

  const sectionTitle = () => (
    <Grid item>
      <Grid
        container
        sx={{ minHeight: '0.5rem', backgroundColor: theme.palette.primary.main }}
        direction="row"
        justifyContent="space-around"
        alignItems="center"
      >
        <Grid item>
          <Typography variant="button"> </Typography>
        </Grid>
      </Grid>
    </Grid>
  );

  const pageFooter = () => (
    <Grid container direction="row" justifyContent="space-between" alignItems="center">
      <Grid item>
        <CancelButton onClick={handleCancel} />
      </Grid>
      <Grid item>
        <ConfirmButton onClick={handleConfirm} />
      </Grid>
    </Grid>
  );

  const titleContent = () => (
    <Grid item>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item xs={LABEL_WIDTH}>
          <Typography variant={LABEL_STYLE}>Title</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          <Typography variant={CONTENT_STYLE}>{getProposal().title}</Typography>
        </Grid>
        <Grid item xs={LABEL_WIDTH}>
          <Typography variant={LABEL_STYLE}>Proposal Type</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          <Typography variant={CONTENT_STYLE}>{proposalType()}</Typography>
        </Grid>
      </Grid>
    </Grid>
  );

  const teamContent = () => (
    <Grid item>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item xs={LABEL_WIDTH}>
          <Typography variant={LABEL_STYLE}>Members</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          {getProposal().team.map((rec: TeamMember) => (
            <Grid container direction="row" justifyContent="space-between" alignItems="center">
              <Grid item xs={4}>
                <Typography
                  variant={CONTENT_STYLE}
                >
                  {`${rec.firstName} ${rec.lastName}`}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant={CONTENT_STYLE}>{rec.email}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant={CONTENT_STYLE}>{rec.pi ? 'PI' : ''}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant={CONTENT_STYLE}>{rec.phdThesis ? 'PhD Thesis' : ''}</Typography>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );

  const generalContent = () => (
    <Grid item>
      <Grid container direction="row" justifyContent="space-around" alignItems="center">
        <Grid item xs={LABEL_WIDTH}>
          <Typography variant={LABEL_STYLE}>Abstract</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          <Typography variant={CONTENT_STYLE}>{getProposal().abstract}</Typography>
        </Grid>
        <Grid item xs={LABEL_WIDTH}>
          <Typography variant={LABEL_STYLE}>Category</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          <Typography variant={CONTENT_STYLE}>{category()}</Typography>
        </Grid>
      </Grid>
    </Grid>
  );

  const scienceContent = () => (
    <Grid item>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item xs={LABEL_WIDTH}>
          <Typography variant={LABEL_STYLE}>File name</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          <Typography variant={CONTENT_STYLE}>
            {(getProposal().sciencePDF as unknown) as string}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );

  const targetContent = () => (
    <Grid item>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item xs={LABEL_WIDTH}>
          <Typography variant={LABEL_STYLE}>Targets</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          {getProposal().targets.map((rec: Target) => (
            <Grid container direction="row" justifyContent="space-between" alignItems="center">
              <Grid item xs={2}>
                <Typography variant={CONTENT_STYLE}>{rec.id}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant={CONTENT_STYLE}>{rec.name}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant={CONTENT_STYLE}>{rec.ra}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant={CONTENT_STYLE}>{rec.dec}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant={CONTENT_STYLE}>{rec.vel}</Typography>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );

  const observationsContent = () => (
    <Grid item>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item xs={LABEL_WIDTH}>
          <Typography variant={LABEL_STYLE}>Observations</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          {getProposal().observations.map((rec: Observation) => (
            <Grid container direction="row" justifyContent="space-between" alignItems="center">
              <Grid item xs={2}>
                <Typography variant={CONTENT_STYLE}>{rec.id}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant={CONTENT_STYLE}>{telescope(rec.telescope)}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant={CONTENT_STYLE}>
                  {subarray(rec.telescope, rec.subarray)}
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant={CONTENT_STYLE}>{observationType(rec.type)}</Typography>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );

  const targetObservationContent = () => (
    <Grid item>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item xs={LABEL_WIDTH}>
          <Typography variant={LABEL_STYLE}>Target Selections</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          {getProposal().targetObservation.map(
            (rec: { targetId: number; observationId: number }) => (
              <Grid container direction="row" justifyContent="space-between" alignItems="center">
                <Grid item xs={2}>
                  <Typography variant={CONTENT_STYLE}>{rec.targetId}</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant={CONTENT_STYLE}>{rec.observationId}</Typography>
                </Grid>
              </Grid>
            )
          )}
        </Grid>
      </Grid>
    </Grid>
  );

  const technicalContent = () => (
    <Grid item>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item xs={LABEL_WIDTH}>
          <Typography variant={LABEL_STYLE}>File name</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          <Typography variant={CONTENT_STYLE}>
            {(getProposal().technicalPDF as unknown) as string}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );

  const dataContent = () => (
    <Grid item>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item xs={LABEL_WIDTH}>
          <Typography variant={LABEL_STYLE}>Pipeline</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          <Typography variant={CONTENT_STYLE}>{getProposal().pipeline}</Typography>
        </Grid>
      </Grid>
    </Grid>
  );

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={handleCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      id="alert-dialog-proposal-change"
    >
      {pageTitle('SKAO Cycle')}
      <DialogContent>
        <Grid
          p={2}
          container
          direction="column"
          alignItems="space-evenly"
          justifyContent="space-around"
        >
          {sectionTitle()}
          {titleContent()}
          {sectionTitle()}
          {teamContent()}
          {sectionTitle()}
          {generalContent()}
          {sectionTitle()}
          {scienceContent()}
          {sectionTitle()}
          {targetContent()}
          {sectionTitle()}
          {observationsContent()}
          {sectionTitle()}
          {targetObservationContent()}
          {sectionTitle()}
          {technicalContent()}
          {sectionTitle()}
          {dataContent()}
        </Grid>
      </DialogContent>
      <DialogActions>{pageFooter()}</DialogActions>
    </Dialog>
  );
}
