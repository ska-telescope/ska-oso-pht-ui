import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import { DialogActions, DialogContent, Grid, Typography } from '@mui/material';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import useTheme from '@mui/material/styles/useTheme';
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
import { presentLatex } from '../../../utils/present';

interface ValidationResultsProps {
  proposal: Proposal;
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

export default function ValidationResults({
  proposal,
  open,
  onClose,
  onConfirm,
  onConfirmLabel = ''
}: ValidationResultsProps) {
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

  const proposalType = () => {
    const proposalType = proposal.proposalType;
    const proposalName =
      !proposalType || proposalType < 1 ? NOT_SPECIFIED : t('proposalType.title.' + proposalType);
    return `${proposalName}`;
  };

  const proposalAttributes = () => {
    let output = [];
    const subTypes: number[] = proposal.proposalSubType;
    if (subTypes?.length && subTypes[0] > 0) {
      subTypes.forEach(element => output.push(t('proposalAttribute.title.' + element)));
    }
    return output;
  };

  const scienceCategory = () => {
    const scienceCat = proposal.scienceCategory;
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
        {!optional && inArr?.length === 0 && emptyCell()}
        {inArr?.length > 0 && (
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
      {onConfirmLabel?.length > 0 && (
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
        <Grid item>
          <Typography id="title" variant={TITLE_STYLE} style={{ fontWeight: getFont(BOLD_LABEL) }}>
            {t('validationResults.title')}
          </Typography>
        </Grid>
        <Grid item>{proposal.title}</Grid>
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
      {proposal === null && (
        <Alert
          color={AlertColorTypes.Warning}
          text={t('displayProposal.warning')}
          testId="helpPanelId"
        />
      )}
      {proposal !== null && (
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
          </Grid>
        </DialogContent>
      )}
    </Dialog>
  );
}
