import Dialog from '@mui/material/Dialog';
import { Box, DialogContent, Grid, Typography } from '@mui/material';
import { AlertColorTypes, DropDown } from '@ska-telescope/ska-gui-components';
import { useTheme } from '@mui/material/styles';
import { presentLatex, trimText } from '@utils/present/present';
import React from 'react';
import Proposal from '../../../utils/types/proposal';
import Alert from '../standardAlert/StandardAlert';
import GridMembers from '../../grid/members/GridMembers';
import skaoIcon from '../../icon/skaoIcon/skaoIcon';
import ConfirmButton from '@/components/button/Confirm/Confirm';
import CancelButton from '@/components/button/Cancel/Cancel';
import { CONFLICT_REASONS, PAGE_CYCLE, PAGE_TITLE_ADD } from '@/utils/constants';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface ConflictConfirmationProps {
  proposal: Proposal | null;
  open: boolean;
  onClose: Function;
  onConfirm: Function;
  onConfirmLabel?: string;
  onConfirmToolTip?: string;
}

const MODAL_WIDTH = '75%';
const GRID_HEIGHT = 300;
const TITLE_STYLE = 'h5';
const LABEL_WIDTH = 4;
const LABEL_STYLE = 'subtitle1';
const CONTENT_STYLE = 'subtitle2';
const BOLD_LABEL = true;
const BOLD_CONTENT = false;

export default function ConflictConfirmation({
  proposal,
  open,
  onConfirm,
  onConfirmLabel = '',
  onConfirmToolTip = ''
}: ConflictConfirmationProps) {
  const { t } = useScopedTranslation();
  const theme = useTheme();

  const getFont = (bold: boolean) => (bold ? 600 : 300);
  const [reason, setReason] = React.useState(CONFLICT_REASONS[0]);

  const handleConfirm = () => {
    onConfirm(reason);
  };

  const handleCancel = () => {
    onConfirm('cancel');
  };

  const title = (inLabel: string, inValue: string) => {
    return (
      <Box
        id={'title-box'}
        sx={{
          pl: 2,
          pr: 2,
          width: '100%',
          maxWidth: '100%',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          boxSizing: 'border-box'
        }}
      >
        <Typography id="title" variant={TITLE_STYLE} style={{ fontWeight: getFont(BOLD_LABEL) }}>
          {inLabel} {presentLatex(trimText(inValue, 30))}
        </Typography>
      </Box>
    );
  };

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
      <Grid container direction="row" justifyContent="space-around" alignItems="center">
        <Grid size={{ xs: LABEL_WIDTH + 1 }}>{label(inLabel)}</Grid>
        <Grid size={{ xs: 11 - LABEL_WIDTH }}>{content(inValue)}</Grid>
      </Grid>
    );
  };

  const sectionTitle = () => (
    <Grid>
      <Grid
        container
        sx={{ minHeight: '0.5rem', backgroundColor: theme.palette.primary.main }}
        direction="row"
        justifyContent="space-around"
        alignItems="center"
      >
        <Grid>
          <Typography variant="button"> </Typography>
        </Grid>
      </Grid>
    </Grid>
  );

  const getOptions = () => {
    return CONFLICT_REASONS.map(e => ({ label: t('conflict.reason.' + e), value: e }));
  };

  const buttonLeft = () => <CancelButton action={handleCancel} testId="cancelButtonTestId" />;

  const buttonRight = () => (
    <ConfirmButton
      action={handleConfirm}
      primary
      testId="displayConfirmationButton"
      title={onConfirmLabel}
      toolTip={onConfirmToolTip}
    />
  );

  const pageDropdown = () => (
    <Grid p={5} container direction="row" alignItems="center" justifyContent="space-around">
      <Grid>
        <Box minWidth={800}>
          <DropDown
            value={reason}
            label={t('conflict.label')}
            options={getOptions()}
            required
            setValue={setReason}
            testId={'conflictConfirmationGroupDropDown'}
          />
        </Box>
      </Grid>
    </Grid>
  );

  const pageFooter = () => (
    <Grid
      container
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ width: '100%' }}
    >
      <Grid>{buttonLeft()}</Grid>
      <Grid>{buttonRight()}</Grid>
    </Grid>
  );

  const headerContent = () => (
    <Grid>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid size={{ xs: 2 }}>{skaoIcon({ useSymbol: false })}</Grid>
        <Grid size={{ xs: 6 }}>
          {title(t('page.' + PAGE_TITLE_ADD + '.title') + '  ', proposal?.title ?? '')}
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Grid container direction="column" justifyContent="space-between" alignItems="right">
            <Grid>{details(t('page.' + PAGE_CYCLE + '.short'), proposal?.cycle ?? '')}</Grid>
            <Grid>{details(t('proposalId.label'), proposal?.id ?? '')}</Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  const investigatorsContentGrid = () => (
    <>
      <Grid>
        <Grid>{label(t('members.label'))}</Grid>
      </Grid>
      <Grid>
        <GridMembers height={GRID_HEIGHT} rows={proposal?.investigators} />
      </Grid>
    </>
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
            {investigatorsContentGrid()}
            {sectionTitle()}
            {pageDropdown()}
            {pageFooter()}
          </Grid>
        </DialogContent>
      )}
    </Dialog>
  );
}
