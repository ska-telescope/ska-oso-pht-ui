import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import { Box, DialogActions, DialogContent, Grid, Typography } from '@mui/material';
import { AlertColorTypes, DropDown } from '@ska-telescope/ska-gui-components';
import { useTheme } from '@mui/material/styles';
import { presentLatex } from '@utils/present/present';
import React from 'react';
import Proposal from '../../../utils/types/proposal';
import Alert from '../standardAlert/StandardAlert';
import GridMembers from '../../grid/members/GridMembers';
import skaoIcon from '../../icon/skaoIcon/skaoIcon';
import ConfirmButton from '@/components/button/Confirm/Confirm';

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
  onClose,
  onConfirm,
  onConfirmLabel = '',
  onConfirmToolTip = ''
}: ConflictConfirmationProps) {
  const { t } = useTranslation('pht');
  const theme = useTheme();

  const getFont = (bold: boolean) => (bold ? 600 : 300);
  const [reason, setReason] = React.useState(0);

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onClose();
  };

  const title = (inLabel: string, inValue: string) => {
    const trimText = (text: string, maxLength: number): string => {
      if (!text || maxLength <= 0) return '';
      return text.length > maxLength ? text.slice(0, maxLength).trimEnd() + '...' : text;
    };

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
    return [0, 1, 2, 3].map(e => ({ label: t('conflict.reason.' + e), value: e }));
  };

  const footerRight = () => (
    <Grid
      container
      spacing={1}
      direction="row"
      alignItems="center"
      justifyContent="flex-start"
      pr={2}
    >
      {onConfirmLabel && (
        <Grid>
          <ConfirmButton
            action={handleConfirm}
            primary
            testId="displayConfirmationButton"
            title={onConfirmLabel}
            toolTip={onConfirmToolTip}
          />
        </Grid>
      )}
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
      <Grid size={{ xs: 8 }}>
        <DropDown
          value={reason}
          label={t('conflict.label')}
          options={getOptions()}
          required
          setValue={setReason}
          testId={'conflictConfirmationGroupDropDown'}
          sx={{ minWidth: 500 }}
        />
      </Grid>
      <Grid>
        <Grid container direction="row" alignItems="center" justifyContent="flex-end">
          <Grid>{footerRight()}</Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  const headerContent = () => (
    <Grid>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid size={{ xs: 1 }}>{skaoIcon({ useSymbol: true })}</Grid>
        <Grid size={{ xs: 7 }}>{title(t('page.9.title') + '  ', proposal?.title ?? '')}</Grid>
        <Grid size={{ xs: 4 }}>
          <Grid container direction="column" justifyContent="space-between" alignItems="right">
            <Grid>{details(t('page.12.short'), proposal?.cycle ?? '')}</Grid>
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
          </Grid>
        </DialogContent>
      )}
      <DialogActions sx={{ padding: 5 }}>{pageFooter()}</DialogActions>
    </Dialog>
  );
}
