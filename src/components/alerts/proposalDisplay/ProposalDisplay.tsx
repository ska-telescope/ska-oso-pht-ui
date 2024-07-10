import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import { DialogActions, DialogContent, Grid, Typography } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import CancelButton from '../../button/Cancel/Cancel';
import ConfirmButton from '../../button/Confirm/Confirm';
import Proposal from '../../../utils/types/proposal';
import { GENERAL, Projects } from '../../../utils/constants';
import TeamMember from '../../../utils/types/teamMember';
import Target from '../../../utils/types/target';
import Observation from '../../../utils/types/observation';
import DownloadButton from '../../button/Download/Download';
import { Alert, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import DownloadIcon from '../../icon/downloadIcon/downloadIcon';
import GetPresignedDownloadUrl from '../../../services/axios/getPresignedDownloadUrl/getPresignedDownloadUrl';

interface ProposalDisplayProps {
  open: boolean;
  onClose: Function;
  onConfirm: Function;
  onConfirmLabel?: string;
}

const LABEL_WIDTH = 3;
const LABEL_STYLE = 'subtitle1';
const CONTENT_WIDTH = 12 - LABEL_WIDTH;
const CONTENT_STYLE = 'subtitle2';

export default function ProposalDisplay({
  open,
  onClose,
  onConfirm,
  onConfirmLabel = ''
}: ProposalDisplayProps) {
  const { t } = useTranslation('pht');
  const theme = useTheme();
  const { application } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleDownload = () => {
    //TODO
  };

  const downloadPdf = async (fileType: string) => {
    try {
      const proposal = getProposal();
      const selectedFile = `${proposal.id}-` + fileType + t('fileType.pdf');
      const signedUrl = await GetPresignedDownloadUrl(selectedFile);

      if (signedUrl === t('pdfDownload.sampleData') || signedUrl === selectedFile) {
        window.open(signedUrl, '_blank');
      }
    } catch (e) {
      new Error(t('pdfDownload.error'));
    }
  };

  const proposalType = () => {
    const proposalType = getProposal().proposalType;
    const proposalName =
      !proposalType || proposalType < 1
        ? t('displayProposal.noneSelected')
        : Projects[proposalType - 1].title;
    return `${proposalName}`;
  };

  const category = () => {
    const proposalType = getProposal().proposalType;
    const proposalName =
      !proposalType || proposalType < 1
        ? t('displayProposal.noneSelected')
        : t(`scienceCategory.${proposalType}`);
    const subCategory = getProposal().proposalSubType;
    const subCategoryName =
      !proposalType || proposalType < 1 || !subCategory || subCategory.length < 1
        ? t('displayProposal.noneSelected')
        : t(`scienceSubCategory.${subCategory}`);
    return `${proposalName} / ${subCategoryName}`;
  };

  const telescope = (tel: number) => t(`arrayConfiguration.${tel}`);
  const subarray = (tel: number, arr: number) => t(`subArrayConfiguration.${arr}`);
  const observationType = (type: number) => t(`observationType.${type}`);

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
        <CancelButton action={handleCancel} title="button.close" testId="cancelButtonTestId" />
      </Grid>
      <Grid item>
        <DownloadButton disabled action={handleDownload} />
      </Grid>
      {onConfirmLabel.length > 0 && (
        <Grid item>
          <ConfirmButton action={handleConfirm} title={onConfirmLabel} />
        </Grid>
      )}
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
          <Typography variant={LABEL_STYLE}>{t('proposalType.label')}</Typography>
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
          <Typography variant={LABEL_STYLE}>{t('members.label')}</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          {getProposal().team?.map((rec: TeamMember) => (
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
          <Typography variant={LABEL_STYLE}>{t('category.label')}</Typography>
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
          <Typography variant={LABEL_STYLE}>{t('pdfDownload.science.label')}</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          <Typography variant={CONTENT_STYLE}>
            {getProposal().id}-science{t('fileType.pdf')}
          </Typography>
          <DownloadIcon
            toolTip={t('pdfDownload.science.toolTip')}
            onClick={() => downloadPdf('science')}
          />
        </Grid>
      </Grid>
    </Grid>
  );

  const targetContent = () => (
    <Grid item>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item xs={LABEL_WIDTH}>
          <Typography variant={LABEL_STYLE}>{t('targets.label')}</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          {getProposal().targets?.map((rec: Target) => (
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
          <Typography variant={LABEL_STYLE}>{t('observations.label')}</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          {getProposal().observations?.map((rec: Observation) => (
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
          <Typography variant={LABEL_STYLE}>{t('targetSelection.label')}</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          {getProposal().targetObservation?.map(rec => (
            <Grid container direction="row" justifyContent="space-between" alignItems="center">
              <Grid item xs={2}>
                <Typography variant={CONTENT_STYLE}>{rec.targetId}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant={CONTENT_STYLE}>{rec.observationId}</Typography>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );

  const technicalContent = () => (
    <Grid item>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item xs={LABEL_WIDTH}>
          <Typography variant={LABEL_STYLE}>{t('pdfDownload.technical.label')}</Typography>
        </Grid>
        <Grid item xs={CONTENT_WIDTH}>
          <Typography variant={CONTENT_STYLE}>
            {getProposal().id}-technical{t('fileType.pdf')}
          </Typography>
          <DownloadIcon
            toolTip={t('pdfDownload.technical.toolTip')}
            onClick={() => downloadPdf('technical')}
          />
        </Grid>
      </Grid>
    </Grid>
  );

  const dataContent = () => (
    <Grid item>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item xs={LABEL_WIDTH}>
          <Typography variant={LABEL_STYLE}>{t('observatoryDataProduct.label')}</Typography>
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
      {pageTitle(t('page.12.title'))}
      {getProposal() === null && (
        <Alert testId="timedAlertId" color={AlertColorTypes.Warning}>
          <Typography>{t('displayProposal.warning')}</Typography>
        </Alert>
      )}
      {getProposal() !== null && (
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
            {generalContent()}
            {sectionTitle()}
            {teamContent()}
            {sectionTitle()}
            {targetContent()}
            {sectionTitle()}
            {observationsContent()}
            {sectionTitle()}
            {targetObservationContent()}
            {sectionTitle()}
            {scienceContent()}
            {sectionTitle()}
            {technicalContent()}
            {sectionTitle()}
            {dataContent()}
          </Grid>
        </DialogContent>
      )}
      {getProposal() !== null && <DialogActions>{pageFooter()}</DialogActions>}
    </Dialog>
  );
}
