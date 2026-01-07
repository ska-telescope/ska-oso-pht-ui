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
import { useEffect, useMemo, useState } from 'react';
import CancelButton from '../../button/Cancel/Cancel';
import ConfirmButton from '../../button/Confirm/Confirm';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { presentDate } from '@/utils/present/present';

interface CycleSelectionProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (policy: any) => void;
}

const MODAL_WIDTH = '40%';

export default function CycleSelection({ open, onClose, onConfirm }: CycleSelectionProps) {
  const { t } = useScopedTranslation();
  const theme = useTheme();
  const { osdPolicies, selectedPolicy, setSelectedPolicy } = useOSDAccessors();

  // Local selection state to guarantee immediate highlight independent of store timing
  const initialSelectedId =
    selectedPolicy?.cycleInformation?.cycleId ?? osdPolicies[0]?.cycleInformation?.cycleId ?? null;

  const [localSelectedCycleId, setLocalSelectedCycleId] = useState<string | null>(
    initialSelectedId
  );

  // Keep local selection in sync if store selection changes later or policies load
  useEffect(() => {
    const nextId =
      selectedPolicy?.cycleInformation?.cycleId ??
      osdPolicies[0]?.cycleInformation?.cycleId ??
      null;
    setLocalSelectedCycleId(prev => prev ?? nextId);
  }, [selectedPolicy, osdPolicies]);

  // Derive the currently selected policy for confirm action
  const currentPolicy = useMemo(() => {
    if (!localSelectedCycleId) return null;
    return osdPolicies.find(p => p.cycleInformation?.cycleId === localSelectedCycleId) ?? null;
  }, [osdPolicies, localSelectedCycleId]);

  const handleCardClick = (policy: any) => {
    const id = policy.cycleInformation?.cycleId ?? null;
    setLocalSelectedCycleId(id);
    setSelectedPolicy(policy);
  };

  const title = () => (
    <Box
      id="title-box"
      sx={{
        width: '100%',
        maxWidth: '100%',
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
        boxSizing: 'border-box'
      }}
    >
      <Typography
        id="alert-dialog-title" // accessibility link
        variant="h5"
        fontWeight={600}
        color="text.primary"
      >
        {t('cycle.label')}
      </Typography>
    </Box>
  );

  const details = (inLabel: string, inValue: string | number | null | undefined) => (
    <Grid container direction="row" justifyContent="space-between" alignItems="center">
      <Grid size={{ xs: 6 }}>
        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
          {inLabel}
        </Typography>
      </Grid>
      <Grid size={{ xs: 6 }}>
        <Typography variant="body1" color="text.secondary">
          {inValue ?? ''} {/* null safety */}
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
        <CancelButton
          action={onClose}
          title="closeBtn.label"
          testId="cancelButtonTestId"
          ariaLabel="Cancel cycle selection"
        />
      </Grid>
    </Grid>
  );

  const buttonsRight = () => (
    <Grid container spacing={1} direction="row" alignItems="center" justifyContent="flex-start">
      <Grid>
        <ConfirmButton
          action={() => currentPolicy && onConfirm(currentPolicy)}
          testId="cycleConfirmationButton"
          title="confirmBtn.label"
          ariaLabel="Confirm cycle selection"
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
    <Grid
      container
      spacing={2}
      justifyContent="center"
      sx={{ width: '100%' }}
      id="alert-dialog-description" // accessibility link
    >
      <Grid size={{ xs: 12 }}>
        {details(t('id.label'), currentPolicy?.cycleInformation?.cycleId ?? '')}
      </Grid>
      <Grid size={{ xs: 12 }}>
        {details(t('cycleDescription.label'), currentPolicy?.cycleDescription ?? '')}
      </Grid>
      <Grid size={{ xs: 12 }}>
        {details(
          t('cycleOpens.label'),
          presentDate(currentPolicy?.cycleInformation?.proposalOpen ?? '')
        )}
      </Grid>
      <Grid size={{ xs: 12 }}>
        {details(
          t('cycleCloses.label'),
          presentDate(currentPolicy?.cycleInformation?.proposalClose ?? '')
        )}
      </Grid>
    </Grid>
  );

  const listContent = () => (
    <Grid container spacing={2}>
      {osdPolicies.map(policy => {
        const policyId = policy.cycleInformation?.cycleId;
        const isSelected = policyId && localSelectedCycleId === policyId;

        return (
          <Grid size={{ xs: 12 }} key={policy.cycleNumber ?? policyId}>
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
              <CardActionArea onClick={() => handleCardClick(policy)}>
                <CardContent>
                  <Typography
                    data-testid={policy.cycleInformation.cycleId}
                    variant="h6"
                    color="text.primary"
                  >
                    {t('id.label')}: {policy.cycleInformation.cycleId}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {t('cycleDescription.label')}: {policy.cycleDescription}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('cycleOpens.label')}: {presentDate(policy.cycleInformation.proposalOpen)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('cycleCloses.label')}: {presentDate(policy.cycleInformation.proposalClose)}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );

  // Guard against empty data to avoid rendering a non-selected list
  const content = osdPolicies.length <= 1 ? descriptionContent() : listContent();

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
          {content}
          {sectionTitle()}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ padding: 5, paddingTop: 0 }}>{pageFooter()}</DialogActions>
    </Dialog>
  );
}
