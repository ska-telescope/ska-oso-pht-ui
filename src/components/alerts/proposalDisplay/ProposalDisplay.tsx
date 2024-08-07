import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import { DialogActions, DialogContent, Grid, Typography } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import CancelButton from '../../button/Cancel/Cancel';
import ConfirmButton from '../../button/Confirm/Confirm';
import Proposal from '../../../utils/types/proposal';
import {
  BANDWIDTH_TELESCOPE,
  NOT_SPECIFIED,
  OBSERVATION,
  Projects
} from '../../../utils/constants';
import Target from '../../../utils/types/target';
import Observation from '../../../utils/types/observation';
import DownloadButton from '../../button/Download/Download';
import { Alert, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import DownloadIcon from '../../icon/downloadIcon/downloadIcon';
import GetPresignedDownloadUrl from '../../../services/axios/getPresignedDownloadUrl/getPresignedDownloadUrl';
import GridMembers from '../../grid/members/GridMembers';

interface ProposalDisplayProps {
  open: boolean;
  onClose: Function;
  onConfirm: Function;
  onConfirmLabel?: string;
}

const TITLE_STYLE = 'h5';
const LABEL_WIDTH = 4;
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

  React.useEffect(() => {
    console.log('TREVOR', getProposal());
  }, []);

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

  const subProposalTypes = () => {
    const proposalType = getProposal().proposalType;
    // const subType = getProposal().proposalSubType;
    const proposalName =
      !proposalType || proposalType < 1
        ? t('displayProposal.noneSelected')
        : Projects[proposalType - 1].title;
    return `${proposalName}`;
  };

  const scienceCategory = () => {
    const scienceCat = getProposal().scienceCategory;
    return scienceCat ? t(`scienceCategory.${scienceCat}`) : t(`scienceCategory.${NOT_SPECIFIED}`);
    // NOT REQUIRED, BUT MAY BE IN THE FUTURE SO KEEP
    //const scienceSubCat = getProposal().scienceSubCategory;
    //const scienceSubCatLabel = getProposal().scienceSubCategory
    //  ? t(`scienceSubCategory.${scienceSubCat}`)
    //  : t(`scienceSubCat.${NOT_SPECIFIED}`);
    // return `${scienceCatLabel} / ${scienceSubCatLabel}`;
  };

  // const telescope = (tel: number) => t(`arrayConfiguration.${tel}`);
  // const subarray = (tel: number, arr: number) => t(`subArrayConfiguration.${arr}`);
  // const observationType = (type: number) => t(`observationType.${type}`);

  const title = (inValue: string) => (
    <Typography variant={TITLE_STYLE} style={{ fontWeight: 600 }}>
      {inValue}
    </Typography>
  );
  const label = (inValue: string) => (
    <Typography variant={LABEL_STYLE} style={{ fontWeight: 600 }}>
      {inValue}
    </Typography>
  );
  const content = (inValue: string | number) => (
    <Typography variant={CONTENT_STYLE}>{inValue}</Typography>
  );

  const cycle = (inLabel: string, inValue: string | number) => {
    return (
      <Grid container direction="row" justifyContent="space-around" alignItems="center">
        <Grid item xs={LABEL_WIDTH + 1}>
          {label(inLabel)}
        </Grid>
        <Grid item xs={11 - LABEL_WIDTH}>
          {content(inValue)}
        </Grid>
      </Grid>
    );
  };

  const entry = (inLabel: string, inValue: string | number) => {
    return (
      <Grid container direction="row" justifyContent="space-around" alignItems="center">
        <Grid item xs={LABEL_WIDTH}>
          {label(inLabel)}
        </Grid>
        <Grid item xs={12 - LABEL_WIDTH}>
          {content(inValue)}
        </Grid>
      </Grid>
    );
  };

  const link = (inLabel: string, toolTip: string, onClick: Function, contents: any) => {
    return (
      <Grid container direction="row" justifyContent="space-around" alignItems="center">
        <Grid item xs={LABEL_WIDTH}>
          {label(inLabel)}
        </Grid>
        <Grid item xs={12 - LABEL_WIDTH}>
          {contents && <DownloadIcon toolTip={toolTip} onClick={onClick} />}
          {!contents && content(t('none'))}
        </Grid>
      </Grid>
    );
  };

  const getObservationTargets = (rec: Observation) => {
    const array = getProposal().targetObservation.filter(e => e.observationId === rec.id);
    console.log('TREVOR ARRAY', array);
    if (array || array.length === 0) {
      return t('none');
    }
    return 'HELLO';
  };

  const sensitivityIntegrationTime = (rec: Observation) => {
    return (
      OBSERVATION?.Supplied[rec.supplied.type]?.label +
      ' ' +
      rec.supplied.value +
      ' ' +
      OBSERVATION?.Supplied[rec.supplied.type]?.units.find(e => (e.value = rec.supplied.units))
        ?.label
    );
  };

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
          <ConfirmButton
            action={handleConfirm}
            testId="displayConfirmationButton"
            title={onConfirmLabel}
          />
        </Grid>
      )}
    </Grid>
  );

  const headerContent = () => (
    <Grid item>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item xs={2}>
          LOGO
        </Grid>
        <Grid item xs={6}>
          {title(t('page.9.title') + ' : ' + getProposal().title)}
        </Grid>
        <Grid item xs={4}>
          <Grid container direction="column" justifyContent="space-between" alignItems="center">
            <Grid item>{cycle(t('page.12.title'), getProposal().cycle)}</Grid>
            <Grid item>{content(getProposal().id)}</Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  const abstractContent = () => (
    <Grid item>
      <Grid container direction="column" justifyContent="center" alignItems="center">
        <Grid item>{label(t('abstract.label'))}</Grid>
        <Grid item>{content(getProposal().abstract)}</Grid>
      </Grid>
    </Grid>
  );

  const titleContent = () => (
    <Grid item>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item xs={6}>
          {entry(t('proposalType.label'), proposalType())}
        </Grid>
        <Grid item xs={6}>
          {entry(t('scienceCategory.label'), scienceCategory())}
        </Grid>
        <Grid item xs={6}>
          {entry(t('subProposalType.label'), subProposalTypes())}
        </Grid>
      </Grid>
    </Grid>
  );

  const teamContentGrid = () => (
    <>
      <Grid item>
        <Grid item>{label(t('members.label'))}</Grid>
      </Grid>
      <Grid item>
        <GridMembers rows={getProposal().team} />
      </Grid>
    </>
  );

  const justificationContent = () => (
    <Grid item>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item xs={6}>
          {link(
            t('page.3.label'),
            t('pdfDownload.science.toolTip'),
            () => downloadPdf('science'),
            getProposal().sciencePDF
          )}
        </Grid>
        <Grid item xs={6}>
          {link(
            t('page.3.label'),
            t('pdfDownload.technical.toolTip'),
            () => downloadPdf('technical'),
            getProposal().technicalPDF
          )}
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
    <>
      <Grid item>
        <Grid item>{label(t('page.10.label'))}</Grid>
      </Grid>

      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item>{label(t('name.label'))}</Grid>
        <Grid item>{label(t('page.4.label'))}</Grid>
        <Grid item>{label(t('observationType.label'))}</Grid>
        <Grid item>{label(t('observingBand.label'))}</Grid>
        <Grid item>
          {label(
            t('sensitivityCalculatorResults.sensitivity') +
              '/' +
              t('sensitivityCalculatorResults.integrationTime')
          )}
        </Grid>
        <Grid item>{label(t('page.13.label'))}</Grid>
      </Grid>

      <Grid item>
        {getProposal().observations?.map((rec: Observation, index: number) => (
          <Grid
            container
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            key={index}
          >
            <Grid item>{content(rec.id)}</Grid>
            <Grid item>{content(getObservationTargets(rec))}</Grid>
            <Grid item>{content(t('observationType.' + rec.type))}</Grid>
            <Grid item>{content(BANDWIDTH_TELESCOPE[rec.observingBand].label)}</Grid>
            <Grid item>{content(sensitivityIntegrationTime(rec))}</Grid>
            <Grid item>{content(t('page.13.label'))}</Grid>
          </Grid>
        ))}
      </Grid>
    </>
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
      open={open}
      onClose={handleCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      id="alert-dialog-proposal-change"
      PaperProps={{
        style: {
          minWidth: '95%',
          maxWidth: '95%'
        }
      }}
    >
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
            {headerContent()}
            {sectionTitle()}
            {abstractContent()}
            {sectionTitle()}
            {titleContent()}
            {sectionTitle()}
            {justificationContent()}
            {sectionTitle()}
            {observationsContent()}
            {sectionTitle()}
            {teamContentGrid()}
            {false && sectionTitle()}
            {false && targetContent()}
            {false && sectionTitle()}
            {false && targetObservationContent()}
            {false && sectionTitle()}
            {false && dataContent()}
          </Grid>
        </DialogContent>
      )}
      {getProposal() !== null && <DialogActions>{pageFooter()}</DialogActions>}
    </Dialog>
  );
}
