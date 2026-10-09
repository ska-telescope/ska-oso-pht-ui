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
import { presentDateTime } from '@/utils/present/present';

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
    setLocalSelectedCycleId((prev) => prev ?? nextId);
  }, [selectedPolicy, osdPolicies]);

  // Derive the currently selected policy for confirm action
  const currentPolicy = useMemo(() => {
    if (!localSelectedCycleId) return null;
    return osdPolicies.find((p) => p.cycleInformation?.cycleId === localSelectedCycleId) ?? null;
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
        // accessibility link
        id="alert-dialog-title"
        variant="h5"
        sx={{
          fontWeight: 600,
          color: 'text.primary'
        }}
      >
        {t('cycle.label')}
      </Typography>
    </Box>
  );

  const sectionTitle = () => (
    <Grid>
      <Grid
        container
        direction="row"
        sx={{
          justifyContent: 'space-around',
          alignItems: 'center',
          minHeight: '0.5rem',
          backgroundColor: theme.palette.primary.main
        }}
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
      sx={{
        alignItems: 'center',
        justifyContent: 'flex-end',
        pr: 2
      }}
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
    <Grid
      container
      spacing={1}
      direction="row"
      sx={{
        alignItems: 'center',
        justifyContent: 'flex-start'
      }}
    >
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
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
      }}
    >
      <Grid>{buttonsLeft()}</Grid>
      <Grid>{buttonsRight()}</Grid>
    </Grid>
  );

  const headerContent = () => <Grid>{title()}</Grid>;

  const listContent = () => (
    <Grid container spacing={2}>
      {osdPolicies.map((policy) => {
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
                    data-testid={policy.cycleInformation.cycleId + '_ID'}
                    variant="h6"
                    sx={{
                      color: 'text.primary'
                    }}
                  >
                    {t('id.label')}: {policy.cycleInformation.cycleId}
                  </Typography>
                  <Typography
                    data-testid={policy.cycleInformation.cycleId + '_description'}
                    variant="body1"
                    sx={{
                      color: 'text.secondary'
                    }}
                  >
                    {t('cycleDescription.label')}: {policy?.cycleDescription}
                  </Typography>
                  <Typography
                    data-testid={policy.cycleInformation.cycleId + '_opens'}
                    variant="body2"
                    sx={{
                      color: 'text.secondary'
                    }}
                  >
                    {t('cycleOpens.label')}:{' '}
                    {presentDateTime(policy.cycleInformation.proposalOpen, {
                      timeZoneName: 'short'
                    })}
                  </Typography>
                  <Typography
                    data-testid={policy.cycleInformation.cycleId + '_closes'}
                    variant="body2"
                    sx={{
                      color: 'text.secondary'
                    }}
                  >
                    {t('cycleCloses.label')}:{' '}
                    {presentDateTime(policy.cycleInformation.proposalClose, {
                      timeZoneName: 'short'
                    })}
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
      slotProps={{
        paper: {
          style: {
            minWidth: MODAL_WIDTH,
            maxWidth: MODAL_WIDTH
          }
        }
      }}
    >
      <DialogContent>
        <Grid
          spacing={1}
          container
          sx={{
            flexDirection: 'column',
            p: 2,
            alignItems: 'space-evenly',
            justifyContent: 'space-around'
          }}
        >
          {headerContent()}
          {sectionTitle()}
          {listContent()}
          {sectionTitle()}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ padding: 5, paddingTop: 0 }}>{pageFooter()}</DialogActions>
    </Dialog>
  );
}
