import Dialog from '@mui/material/Dialog';
import {
  Box,
  DialogActions,
  DialogContent,
  Grid,
  Typography,
  Card,
  CardActionArea,
  CardContent
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CancelButton from '../../button/Cancel/Cancel';
import ConfirmButton from '../../button/Confirm/Confirm';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';

interface CycleSelectionProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (policy: any) => void; // now returns the whole policy object
}

const MODAL_WIDTH = '40%';

export default function CycleSelection({ open, onClose, onConfirm }: CycleSelectionProps) {
  const { t } = useScopedTranslation();
  const theme = useTheme();
  const {
    osdPolicies,
    selectedPolicy,
    setSelectedPolicy,
    osdCloses,
    osdCycleDescription,
    osdCycleId,
    osdOpens
  } = useOSDAccessors();

  const title = () => (
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
      <Typography id="title" variant="h5" fontWeight={600} color="text.primary">
        {t('cycle.label')}
      </Typography>
    </Box>
  );

  const details = (inLabel: string, inValue: string | number) => (
    <Grid container direction="row" justifyContent="space-between" alignItems="center">
      <Grid size={{ xs: 6 }}>
        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
          {inLabel}
        </Typography>
      </Grid>
      <Grid size={{ xs: 6 }}>
        <Typography variant="body1" color="text.secondary">
          {inValue}
        </Typography>
      </Grid>
    </Grid>
  );

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
        <CancelButton action={onClose} title="closeBtn.label" testId="cancelButtonTestId" />
      </Grid>
    </Grid>
  );

  const buttonsRight = () => (
    <Grid container spacing={1} direction="row" alignItems="center" justifyContent="flex-start">
      <Grid>
        <ConfirmButton
          action={() => onConfirm(selectedPolicy!)}
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
      <Grid size={{ xs: 12 }}>{details(t('id.label'), osdCycleId ?? '')}</Grid>
      <Grid size={{ xs: 12 }}>
        {details(t('cycleDescription.label'), osdCycleDescription ?? '')}
      </Grid>
      <Grid size={{ xs: 12 }}>{details(t('cycleOpens.label'), osdOpens(true) ?? '')}</Grid>
      <Grid size={{ xs: 12 }}>{details(t('cycleCloses.label'), osdCloses(true) ?? '')}</Grid>
    </Grid>
  );

  const listContent = () => (
    <Grid container spacing={2}>
      {osdPolicies.map(policy => {
        const isSelected = selectedPolicy?.cycleNumber === policy.cycleNumber;
        return (
          <Grid size={{ xs: 12 }} key={policy.cycleNumber}>
            <Card
              variant="outlined"
              sx={{
                border: isSelected
                  ? `2px solid ${theme.palette.primary.main}`
                  : `1px solid ${theme.palette.divider}`,
                backgroundColor: isSelected
                  ? theme.palette.action.selected
                  : theme.palette.background.paper,
                transition: '0.2s',
                '&:hover': {
                  boxShadow: 4,
                  cursor: 'pointer'
                }
              }}
            >
              <CardActionArea onClick={() => setSelectedPolicy(policy)}>
                <CardContent>
                  <Typography variant="h6" color="text.primary">
                    {t('id.label')}: {policy.cycleInformation.cycleId}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {t('cycleDescription.label')}: {policy.cycleDescription}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('cycleOpens.label')}: {policy.cycleInformation.proposalOpen}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('cycleCloses.label')}: {policy.cycleInformation.proposalClose}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          {osdPolicies.length <= 1 ? descriptionContent() : listContent()}
          {sectionTitle()}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ padding: 5, paddingTop: 0 }}>{pageFooter()}</DialogActions>
    </Dialog>
  );
}
