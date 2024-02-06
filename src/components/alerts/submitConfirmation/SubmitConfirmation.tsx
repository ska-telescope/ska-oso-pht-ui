import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import { DialogActions, DialogContent, Grid, Typography } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import CancelButton from '../../button/cancel/CancelButton';
import ConfirmButton from '../../button/confirm/ConfirmButton';
import { Proposal } from '../../../services/types/proposal';
import { GENERAL, Projects } from '../../../utils/constants';
import TeamMember from '../../../services/types/teamMember';
import Target from '../../../services/types/target';
import Observation from '../../../services/types/observation';
import PutProposal from '../../../services/axios/putProposal/putProposal';
import { Alert, AlertColorTypes } from '@ska-telescope/ska-gui-components';

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
  const { t } = useTranslation('pht');
  const theme = useTheme();
  const { application } = storageObject.useStore();

  const [axiosSaveError, setAxiosSaveError] = React.useState('');
  const [axiosSaveErrorColor, setAxiosSaveErrorColor] = React.useState(null);

  const getProposal = () => {
    const p = application.content2 as Proposal;
    return p;
  };

  const handleConfirm = response => {
    if (response && !response.error) {
      // Handle successful response
      setAxiosSaveError(`Success: ${response}`);
      setAxiosSaveErrorColor(AlertColorTypes.Success);
    } else {
      // Handle error response
      setAxiosSaveError(response.error);
      setAxiosSaveErrorColor(AlertColorTypes.Error);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const proposalType = () => {
    const pt = getProposal().proposalType;
    const pName = !pt || pt < 1 ? t('label.noneSelected') : Projects[pt - 1].title;
    const st = getProposal().proposalSubType;
    const sName =
      !pt || pt < 1 || !st || st < 1
        ? t('label.noneSelected')
        : Projects[pt - 1].subProjects[st - 1].title;
    return `${pName} / ${sName}`;
  };

  const category = () => {
    const pt = getProposal().category;
    const pName = !pt || pt < 1 ? t('label.noneSelected') : t(`scienceCategory.${pt}`);
    const st = getProposal().subCategory;
    const sName =
      !pt || pt < 1 || !st || st < 1 ? t('label.noneSelected') : t(`scienceSubCategory.${st}`);
    return `${pName} / ${sName}`;
  };

  const telescope = (tel: number) => t(`dropdown.telescope.${tel}.title`);
  const subarray = (tel: number, arr: number) => t(`dropdown.telescope.${tel}.array.${arr}`);
  const observationType = (type: number) => t(`dropdown.observationType.${type}`);

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
          <Typography variant={LABEL_STYLE}>{t('title.label')}</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          <Typography variant={CONTENT_STYLE}>{getProposal().title}</Typography>
        </Grid>
        <Grid item xs={LABEL_WIDTH}>
          <Typography variant={LABEL_STYLE}>{t('label.proposalType')}</Typography>
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
          <Typography variant={LABEL_STYLE}>{t('label.members')}</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          {getProposal().team.map((rec: TeamMember) => (
            <Grid container direction="row" justifyContent="space-between" alignItems="center">
              <Grid item xs={4}>
                <Typography variant={CONTENT_STYLE}>
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
          <Typography variant={LABEL_STYLE}>{t('abstract.label')}</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          <Typography variant={CONTENT_STYLE}>{getProposal().abstract}</Typography>
        </Grid>
        <Grid item xs={LABEL_WIDTH}>
          <Typography variant={LABEL_STYLE}>{t('label.category')}</Typography>
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
          <Typography variant={LABEL_STYLE}>{t('label.fileName')}</Typography>
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
          <Typography variant={LABEL_STYLE}>{t('label.targets')}</Typography>
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
          <Typography variant={LABEL_STYLE}>{t('label.observations')}</Typography>
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
          <Typography variant={LABEL_STYLE}>{t('label.targetSelection')}</Typography>
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
          <Typography variant={LABEL_STYLE}>{t('label.fileName')}</Typography>
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
          <Typography variant={LABEL_STYLE}>{t('label.pipeline')}</Typography>
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
      {pageTitle(t('page.11.title'))}
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
          {axiosSaveError ? (
            <Alert testId="alertSaveErrorId" color={axiosSaveErrorColor}>
              <Typography>{axiosSaveError}</Typography>
            </Alert>
          ) : null}
        </Grid>
      </DialogContent>
      <DialogActions>{pageFooter()}</DialogActions>
    </Dialog>
  );
}
