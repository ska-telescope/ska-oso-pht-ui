import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import { DialogActions, DialogContent, Grid, Typography } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import CancelButton from '../../button/Cancel/Cancel';
import ConfirmButton from '../../button/Confirm/Confirm';
import Proposal from '../../../utils/types/proposal';
import { NOT_SPECIFIED } from '../../../utils/constants';
import Target from '../../../utils/types/target';
import DownloadButton from '../../button/Download/Download';
import { Alert, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import DownloadIcon from '../../icon/downloadIcon/downloadIcon';
import GetPresignedDownloadUrl from '../../../services/axios/getPresignedDownloadUrl/getPresignedDownloadUrl';
import GridMembers from '../../grid/members/GridMembers';
import skaoIcon from '../../../components/icon/skaoIcon/skaoIcon';
import GridObservationSummary from '../../../components/grid/observationSummary/GridObservationSummary';
import emptyCell from '../../../components/fields/emptyCell/emptyCell';

interface ProposalDisplayProps {
  open: boolean;
  onClose: Function;
  onConfirm: Function;
  onConfirmLabel?: string;
}

const MODAL_WIDTH = '75%';
const GRID_HEIGHT = 300;
const TITLE_STYLE = 'h5';
const LABEL_WIDTH = 4;
const LABEL_STYLE = 'subtitle1';
const CONTENT_WIDTH = 12 - LABEL_WIDTH;
const CONTENT_STYLE = 'subtitle2';
const BOLD_LABEL = true;
const BOLD_CONTENT = false;

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

  const getFont = (bold: boolean) => (bold ? 600 : 300);

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

      window.open(signedUrl, '_blank');

      //TODO: clarify conditions to oepn new window
      // if (signedUrl === t('pdfDownload.sampleData') || signedUrl === selectedFile) {
      //   window.open(signedUrl, '_blank');
      // }
    } catch (e) {
      new Error(t('pdfDownload.error'));
    }
  };

  const proposalType = () => {
    const proposalType = getProposal().proposalType;
    const proposalName =
      !proposalType || proposalType < 1 ? NOT_SPECIFIED : t('proposalType.title.' + proposalType);
    return `${proposalName}`;
  };

  const proposalAttributes = () => {
    let output = [];
    const subTypes: number[] = getProposal().proposalSubType;
    if (subTypes.length && subTypes[0] > 0) {
      subTypes.forEach(element => output.push(t('proposalAttribute.title.' + element)));
    }
    return output;
  };

  const scienceCategory = () => {
    const scienceCat = getProposal().scienceCategory;
    return scienceCat ? t(`scienceCategory.${scienceCat}`) : NOT_SPECIFIED;
  };

  const title = (inValue: string) => (
    <Typography variant={TITLE_STYLE} style={{ fontWeight: getFont(BOLD_LABEL) }}>
      {inValue}
    </Typography>
  );
  const label = (inValue: string) => (
    <Typography variant={LABEL_STYLE} style={{ fontWeight: getFont(BOLD_LABEL) }}>
      {inValue}
    </Typography>
  );
  const content = (inValue: string | number) => (
    <Typography variant={CONTENT_STYLE} style={{ fontWeight: getFont(BOLD_CONTENT) }}>
      {inValue}
    </Typography>
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

  const element = (inValue: number | string, optional: boolean = false) =>
    inValue === NOT_SPECIFIED && !optional ? emptyCell() : content(inValue);

  const elementArray = (inArr: Array<number | string>, optional: boolean = false) => {
    return (
      <>
        {!optional && inArr.length === 0 && emptyCell()}
        {inArr.length > 0 && (
          <Grid container direction="column" justifyContent="space-between" alignItems="left">
            {inArr.map(el => (
              <Grid item xs={12}>
                {element(el)}
              </Grid>
            ))}
          </Grid>
        )}
      </>
    );
  };

  const entry = (inLabel: string, inValue, optional: boolean = false) => {
    return (
      <Grid container direction="row" justifyContent="space-around" alignItems="center">
        <Grid item xs={LABEL_WIDTH}>
          {label(inLabel)}
        </Grid>
        <Grid item xs={12 - LABEL_WIDTH}>
          {typeof inValue !== 'number' &&
            typeof inValue !== 'string' &&
            elementArray(inValue, optional)}
          {typeof inValue === 'number' ||
            (typeof inValue === 'string' && element(inValue, optional))}
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
          {!contents && emptyCell()}
        </Grid>
      </Grid>
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
        <DownloadButton action={handleDownload} disabled testId="downloadButtonTestId" />
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
        <Grid item>{skaoIcon({ useSymbol: true })}</Grid>
        <Grid item>{title(t('page.9.title') + ' : ' + getProposal().title)}</Grid>
        <Grid item>
          <Grid container direction="column" justifyContent="space-between" alignItems="right">
            <Grid item>{cycle(t('page.12.short'), getProposal().cycle)}</Grid>
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
        <Grid item>
          {getProposal().abstract?.length ? content(getProposal().abstract) : emptyCell()}
        </Grid>
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
          {entry(t('proposalAttribute.plural'), proposalAttributes(), true)}
        </Grid>
      </Grid>
    </Grid>
  );

  const observationsContentGrid = () => (
    <>
      <Grid item>
        <Grid item>{label(t('page.10.label'))}</Grid>
      </Grid>
      <Grid item>
        <GridObservationSummary height={GRID_HEIGHT} proposal={getProposal()} />
      </Grid>
    </>
  );

  const teamContentGrid = () => (
    <>
      <Grid item>
        <Grid item>{label(t('members.label'))}</Grid>
      </Grid>
      <Grid item>
        <GridMembers height={GRID_HEIGHT} rows={getProposal().team} />
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
            t('page.6.label'),
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
          minWidth: MODAL_WIDTH,
          maxWidth: MODAL_WIDTH
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
            {observationsContentGrid()}
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
