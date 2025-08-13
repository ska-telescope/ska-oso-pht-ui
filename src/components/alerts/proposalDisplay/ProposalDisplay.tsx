import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import { DialogActions, DialogContent, Grid2, Typography } from '@mui/material';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import useTheme from '@mui/material/styles/useTheme';
import { presentLatex } from '@utils/present/present';
import CancelButton from '../../button/Cancel/Cancel';
import ConfirmButton from '../../button/Confirm/Confirm';
import Proposal from '../../../utils/types/proposal';
import { NOT_SPECIFIED } from '../../../utils/constants';
import DownloadButton from '../../button/Download/Download';
import Alert from '../../alerts/standardAlert/StandardAlert';
import DownloadIcon from '../../icon/downloadIcon/downloadIcon';
import GetPresignedDownloadUrl from '../../../services/axios/getPresignedDownloadUrl/getPresignedDownloadUrl';
import GridMembers from '../../grid/members/GridMembers';
import skaoIcon from '../../../components/icon/skaoIcon/skaoIcon';
import GridObservationSummary from '../../../components/grid/observationSummary/GridObservationSummary';
import emptyCell from '../../../components/fields/emptyCell/emptyCell';

interface ProposalDisplayProps {
  proposal: Proposal | null;
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
const CONTENT_STYLE = 'subtitle2';
const BOLD_LABEL = true;
const BOLD_CONTENT = false;

export default function ProposalDisplay({
  proposal,
  open,
  onClose,
  onConfirm,
  onConfirmLabel = ''
}: ProposalDisplayProps) {
  const { t } = useTranslation('pht');
  const theme = useTheme();

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
      const selectedFile = `${proposal?.id}-` + fileType + t('fileType.pdf');
      const signedUrl = await GetPresignedDownloadUrl(selectedFile);

      window.open(signedUrl, '_blank');

      //TODO: clarify conditions to open new window
      // if (signedUrl === t('pdfDownload.sampleData') || signedUrl === selectedFile) {
      //   window.open(signedUrl, '_blank');
      // }
    } catch (e) {
      new Error(t('pdfDownload.error'));
    }
  };

  const proposalType = () => {
    const proposalType = proposal?.proposalType;
    const proposalName =
      !proposalType || proposalType < 1 ? NOT_SPECIFIED : t('proposalType.title.' + proposalType);
    return `${proposalName}`;
  };

  const proposalAttributes = () => {
    let output: string[] = [];
    const subTypes: number[] = proposal?.proposalSubType ?? [];
    if (subTypes?.length && subTypes[0] > 0) {
      subTypes.forEach(element => output.push(t('proposalAttribute.title.' + element)));
    }
    return output;
  };

  const scienceCategory = () => {
    const scienceCat = proposal?.scienceCategory;
    return scienceCat ? t(`scienceCategory.${scienceCat}`) : NOT_SPECIFIED;
  };

  const title = (inLabel: string, inValue: string) => (
    <Typography id="title" variant={TITLE_STYLE} style={{ fontWeight: getFont(BOLD_LABEL) }}>
      {inLabel} {presentLatex(inValue)}
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

  const details = (inLabel: string, inValue: string | number) => {
    return (
      <Grid2 container direction="row" justifyContent="space-around" alignItems="center">
        <Grid2 size={{ xs: LABEL_WIDTH + 1 }}>{label(inLabel)}</Grid2>
        <Grid2 size={{ xs: 11 - LABEL_WIDTH }}>{content(inValue)}</Grid2>
      </Grid2>
    );
  };

  const element = (inValue: number | string, optional: boolean = false) =>
    inValue === NOT_SPECIFIED && !optional ? emptyCell() : content(inValue);

  const elementArray = (inArr: Array<number | string>, optional: boolean = false) => {
    return (
      <>
        {!optional && inArr?.length === 0 && emptyCell()}
        {inArr?.length > 0 && (
          <Grid2 container direction="column" justifyContent="space-between" alignItems="left">
            {inArr.map(el => (
              <Grid2 key={el} size={{ xs: 12 }}>
                {element(el)}
              </Grid2>
            ))}
          </Grid2>
        )}
      </>
    );
  };

  const entry = (
    inLabel: string,
    inValue: string | (string | number)[],
    optional: boolean = false
  ) => {
    return (
      <Grid2 container direction="row" justifyContent="space-around" alignItems="center">
        <Grid2 size={{ xs: 7 }}>{label(inLabel)}</Grid2>
        <Grid2 size={{ xs: 5 }}>
          {typeof inValue !== 'number' &&
            typeof inValue !== 'string' &&
            elementArray(inValue, optional)}
          {typeof inValue === 'number' ||
            (typeof inValue === 'string' && element(inValue, optional))}
        </Grid2>
      </Grid2>
    );
  };

  const link = (inLabel: string, toolTip: string, onClick: Function, contents: any) => {
    return (
      <Grid2 container direction="row" justifyContent="space-around" alignItems="center">
        <Grid2 size={{ xs: 7 }}>{label(inLabel)}</Grid2>
        <Grid2 size={{ xs: 5 }}>
          {contents && <DownloadIcon toolTip={toolTip} onClick={onClick} />}
          {!contents && emptyCell()}
        </Grid2>
      </Grid2>
    );
  };

  const sectionTitle = () => (
    <Grid2>
      <Grid2
        container
        sx={{ minHeight: '0.5rem', backgroundColor: theme.palette.primary.main }}
        direction="row"
        justifyContent="space-around"
        alignItems="center"
      >
        <Grid2>
          <Typography variant="button"> </Typography>
        </Grid2>
      </Grid2>
    </Grid2>
  );

  const buttonsLeft = () => (
    <Grid2
      container
      spacing={1}
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      pr={2}
    >
      <Grid2>
        <CancelButton action={handleCancel} title="closeBtn.label" testId="cancelButtonTestId" />
      </Grid2>
    </Grid2>
  );

  const buttonsRight = () => (
    <Grid2
      container
      spacing={1}
      direction="row"
      alignItems="center"
      justifyContent="flex-start"
      pr={2}
    >
      {onConfirmLabel && (
        <Grid2>
          <ConfirmButton
            action={handleConfirm}
            testId="displayConfirmationButton"
            title={onConfirmLabel}
          />
        </Grid2>
      )}
    </Grid2>
  );

  const pageFooter = () => (
    <Grid2
      container
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ width: '100%' }}
    >
      <Grid2 size={{ xs: 3 }}>
        <Grid2 container direction="row" alignItems="center" justifyContent="flex-start">
          <Grid2>{buttonsLeft()}</Grid2>
        </Grid2>
      </Grid2>
      <Grid2>
        <DownloadButton action={handleDownload} disabled testId="downloadButtonTestId" />
      </Grid2>
      <Grid2 size={{ xs: 3 }}>
        <Grid2 container direction="row" alignItems="center" justifyContent="flex-end">
          <Grid2>{buttonsRight()}</Grid2>
        </Grid2>
      </Grid2>
    </Grid2>
  );

  const headerContent = () => (
    <Grid2>
      <Grid2 container direction="row" justifyContent="space-between" alignItems="center">
        <Grid2 size={{ xs: 1 }}>{skaoIcon({ useSymbol: true })}</Grid2>
        <Grid2 size={{ xs: 7 }}>{title(t('page.9.title') + '  ', proposal?.title ?? '')}</Grid2>
        <Grid2 size={{ xs: 4 }}>
          <Grid2 container direction="column" justifyContent="space-between" alignItems="right">
            <Grid2>{details(t('page.12.short'), proposal?.cycle ?? '')}</Grid2>
            <Grid2>{details(t('proposalId.label'), proposal?.id ?? '')}</Grid2>
          </Grid2>
        </Grid2>
      </Grid2>
    </Grid2>
  );

  const abstractContent = () => (
    <Grid2>
      <Grid2 container direction="column" justifyContent="center" alignItems="center">
        <Grid2>{label(t('abstract.label'))}</Grid2>
        <Grid2>{proposal?.abstract?.length ? content(proposal?.abstract) : emptyCell()}</Grid2>
      </Grid2>
    </Grid2>
  );

  const titleContent = () => (
    <Grid2>
      <Grid2 container direction="row" justifyContent="space-between" alignItems="center">
        <Grid2 size={{ xs: 6 }}>{entry(t('proposalType.label'), proposalType())}</Grid2>
        <Grid2 size={{ xs: 6 }}>{entry(t('scienceCategory.label'), scienceCategory())}</Grid2>
        <Grid2 pt={2} size={{ xs: 6 }}>
          {entry(t('proposalAttribute.plural'), proposalAttributes(), true)}
        </Grid2>
      </Grid2>
    </Grid2>
  );

  const observationsContentGrid = () => (
    <>
      <Grid2>
        <Grid2>{label(t('page.10.label'))}</Grid2>
      </Grid2>
      <Grid2>
        {proposal && <GridObservationSummary height={GRID_HEIGHT} proposal={proposal} />}
      </Grid2>
    </>
  );

  const teamContentGrid = () => (
    <>
      <Grid2>
        <Grid2>{label(t('members.label'))}</Grid2>
      </Grid2>
      <Grid2>
        <GridMembers height={GRID_HEIGHT} rows={proposal?.investigators} />
      </Grid2>
    </>
  );

  const justificationContent = () => (
    <Grid2>
      <Grid2 container direction="row" justifyContent="space-between" alignItems="center">
        <Grid2 size={{ xs: 6 }}>
          {link(
            t('page.3.label'),
            t('pdfDownload.science.toolTip'),
            () => downloadPdf('science'),
            proposal?.sciencePDF
          )}
        </Grid2>
        <Grid2 size={{ xs: 6 }}>
          {link(
            t('page.6.label'),
            t('pdfDownload.technical.toolTip'),
            () => downloadPdf('technical'),
            proposal?.technicalPDF
          )}
        </Grid2>
      </Grid2>
    </Grid2>
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
      {proposal === null && (
        <Alert
          color={AlertColorTypes.Warning}
          text={t('displayProposal.warning')}
          testId="helpPanelId"
        />
      )}
      {proposal !== null && (
        <DialogContent>
          <Grid2
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
          </Grid2>
        </DialogContent>
      )}
      {proposal !== null && <DialogActions sx={{ padding: 5 }}>{pageFooter()}</DialogActions>}
    </Dialog>
  );
}
