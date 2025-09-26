import Dialog from '@mui/material/Dialog';
import { Box, DialogActions, DialogContent, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CancelButton from '../../button/Cancel/Cancel';
import ConfirmButton from '../../button/Confirm/Confirm';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';

interface CycleSelectionProps {
  open: boolean;
  onClose: Function;
  onConfirm: Function;
}

const MODAL_WIDTH = '40%';
const TITLE_STYLE = 'h5';
const LABEL_WIDTH = 6;
const LABEL_STYLE = 'subtitle1';
const CONTENT_STYLE = 'subtitle2';
const BOLD_LABEL = true;
const BOLD_CONTENT = false;

export default function CycleSelection({ open, onClose, onConfirm }: CycleSelectionProps) {
  const { t } = useScopedTranslation();
  const theme = useTheme();
  const { osdCloses, osdCycleDescription, osdCycleId, osdOpens } = useOSDAccessors();

  const getFont = (bold: boolean) => (bold ? 600 : 300);

  const title = () => {
    return (
      <Box
        id={'title-box'}
        sx={{
          width: '100%',
          maxWidth: '100%',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          boxSizing: 'border-box'
        }}
      >
        <Typography id="title" variant={TITLE_STYLE} style={{ fontWeight: getFont(BOLD_LABEL) }}>
          {t('cycle.label')}
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
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid size={{ xs: LABEL_WIDTH }}>{label(inLabel)}</Grid>
        <Grid size={{ xs: 12 - LABEL_WIDTH }}>{content(inValue)}</Grid>
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

  const buttonsLeft = () => (
    <Grid
      container
      spacing={1}
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      pr={2}
    >
      <Grid>
        <CancelButton action={() => onClose()} title="closeBtn.label" testId="cancelButtonTestId" />
      </Grid>
    </Grid>
  );

  const buttonsRight = () => (
    <Grid container spacing={1} direction="row" alignItems="center" justifyContent="flex-start">
      <Grid>
        <ConfirmButton
          action={() => onConfirm()}
          testId="cycleConfirmationButton"
          title="confirmBtn.label"
        />
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
      <Grid>{buttonsLeft()}</Grid>
      <Grid>{buttonsRight()}</Grid>
    </Grid>
  );

  const headerContent = () => <Grid>{title()}</Grid>;

  const descriptionContent = () => (
    <Grid container spacing={2} justifyContent="center" sx={{ width: '100%' }}>
      <Grid size={8}>{details(t('id.label'), osdCycleId)}</Grid>
      <Grid size={8}>{details(t('cycleDescription.label'), osdCycleDescription)}</Grid>
      <Grid size={8}>{details(t('cycleOpens.label'), osdOpens(true))}</Grid>
      <Grid size={8}>{details(t('cycleCloses.label'), osdCloses(true))}</Grid>
    </Grid>
  );

  return (
    <Dialog
      open={open}
      onClose={() => onClose()}
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
      <DialogContent>
        <Grid
          p={2}
          spacing={1}
          container
          direction="column"
          alignItems="space-evenly"
          justifyContent="space-around"
        >
          {headerContent()}
          {sectionTitle()}
          {descriptionContent()}
          {sectionTitle()}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ padding: 5, paddingTop: 0 }}>{pageFooter()}</DialogActions>
    </Dialog>
  );
}
