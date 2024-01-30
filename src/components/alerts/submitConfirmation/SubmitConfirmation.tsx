import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import { Grid, Typography } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import CancelButton from '../../button/cancel/CancelButton';
import ConfirmButton from '../../button/confirm/ConfirmButton';
import { Proposal } from '../../../services/types/proposal';
import { GENERAL, PAGES, Projects } from '../../../utils/constants';

interface SubmitConfirmationProps {
  open: boolean;
  onClose: Function;
  onConfirm: Function;
}

const LABEL_WIDTH = 4; 
const LABEL_STYLE = 'subtitle1'; 
const CONTENT_WIDTH = 12 - LABEL_WIDTH;
const CONTENT_STYLE = 'subtitle2';

export default function SubmitConfirmation({ open, onClose, onConfirm }: SubmitConfirmationProps) {
  const theme = useTheme();
  const { application } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const proposalType = () => { 
    const pt = getProposal().proposalType;
    const pName = (!pt || pt < 1) ? 'None selected' : Projects[pt - 1].title;
    const st = getProposal().proposalSubType;
    const sName = (!pt || pt < 1 || !st || st < 1) ? 'None selected' : Projects[pt - 1].subProjects[st - 1].title;
    return `${pName  } / ${  sName}`;
  }

  const category = () => { 
    const pt = getProposal().category;
    const pName = (!pt || pt < 1) ? 'None selected' : GENERAL.ScienceCategory[pt - 1].label;
    const st = getProposal().subCategory;
    const sName = (!pt || pt < 1 || !st || st < 1) ? 'None selected' : GENERAL.ScienceCategory[pt - 1].subCategory[st - 1].label;
    return `${pName  } / ${  sName}`;
  }

  const pageTitle = (title: string) => (
    <Grid container direction="row" justifyContent="space-around" alignItems="center">
      <Grid item>
        <Typography variant="h4">
          {title}
        </Typography>
      </Grid>
    </Grid>
  )

  const sectionTitle = (title: string) => (
    <Grid item> 
      <Grid container sx={{ backgroundColor: theme.palette.primary.main }} direction="row" justifyContent="space-around" alignItems="center">
        <Grid item>
          <Typography variant="button">
            {title}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  )

  const pageFooter = () => (
    <Grid item> 
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item>
          <CancelButton onClick={handleCancel} />
        </Grid>
        <Grid item>
          <ConfirmButton onClick={handleConfirm} />
        </Grid>
      </Grid>
    </Grid>
  )

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
  )

  const teamContent = () => (
    <Grid item>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item xs={LABEL_WIDTH}>
          <Typography variant={LABEL_STYLE}>Members</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          <Typography variant={CONTENT_STYLE}>{getProposal().team.length}</Typography>
        </Grid>
      </Grid>
    </Grid>
  )

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
  )

  const scienceContent = () => (
    <Grid item>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item xs={LABEL_WIDTH}>
          <Typography variant={LABEL_STYLE}>File name</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          <Typography variant={CONTENT_STYLE}>{getProposal().sciencePDF?.name}</Typography>
        </Grid>
      </Grid>
    </Grid>
  )

  const targetContent = () => (
    <Grid item>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item xs={LABEL_WIDTH}>
          <Typography variant={LABEL_STYLE}>Targets</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          <Typography variant={CONTENT_STYLE}>{getProposal().targets.length}</Typography>
        </Grid>
      </Grid>
    </Grid>
  )

  const observationsContent = () => (
    <Grid item>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item xs={LABEL_WIDTH}>
          <Typography variant={LABEL_STYLE}>Observations</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          <Typography variant={CONTENT_STYLE}>{getProposal().observations.length}</Typography>
        </Grid>
        <Grid item xs={LABEL_WIDTH}>
          <Typography variant={LABEL_STYLE}>Target Selections</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          <Typography variant={CONTENT_STYLE}>{getProposal().targetObservation.length}</Typography>
        </Grid>
      </Grid>
    </Grid>
  )

  const technicalContent = () => (
    <Grid item>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item xs={LABEL_WIDTH}>
          <Typography variant={LABEL_STYLE}>File name</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          <Typography variant={CONTENT_STYLE}>{getProposal().technicalPDF?.name}</Typography>
        </Grid>
      </Grid>
    </Grid>
  )

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
  )

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      id="alert-dialog-proposal-change"
    >
      <Grid p={2} spacing={2} container direction="column" alignItems="space-evenly" justifyContent="space-around">
        {pageTitle('SUBMIT PROPOSAL')}
        {sectionTitle(PAGES[0])}
        {titleContent()}
        {sectionTitle(PAGES[1])}
        {teamContent()}
        {sectionTitle(PAGES[2])}
        {generalContent()}
        {sectionTitle(PAGES[3])}
        {scienceContent()}
        {sectionTitle(PAGES[4])}
        {targetContent()}
        {sectionTitle(PAGES[5])}
        {observationsContent()}
        {sectionTitle(PAGES[6])}
        {technicalContent()}
        {sectionTitle(PAGES[7])}
        {dataContent()}
        {pageFooter()}
      </Grid>
    </Dialog>
  );
}
