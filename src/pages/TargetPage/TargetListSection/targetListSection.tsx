import React from 'react';
import { Box, Grid, Stack, Tab, Tabs, Typography, useTheme } from '@mui/material';
import { useFormContext, useFormState, useWatch } from 'react-hook-form';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import { ProposalType } from '@/models/proposals/proposal';
import { useTargetEntryForm } from '@/models/proposals/targetEntry';
import {
  RADIAL_MOTION_TYPE,
  REFERENCE_COORDINATE_KIND,
  TargetInput
} from '@/models/proposals/targets';
import { legacyTargetsFromForm } from '@/models/proposals/legacyTargets';
import { REFERENCE_COORDINATE_TYPE_ICRS } from '@utils/constants.ts';
import { leadZero } from '@utils/helpers.ts';
import { removeTarget } from '@/models/proposals/targetOperations';
import TargetEntry from '../../entry/TargetEntry/TargetEntry';
import Alert from '../../../components/alerts/standardAlert/StandardAlert';
import AlertDialog from '../../../components/alerts/alertDialog/AlertDialog';
import FieldWrapper from '../../../components/wrappers/fieldWrapper/FieldWrapper';
import Target from '../../../utils/types/target';
import GridTargets from '../../../components/grid/targets/GridTargets';
import SpatialImaging from './SpatialImaging/SpatialImaging';
import TargetFileImport from './TargetFileImport/TargetFileImport';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import Visualization from '@/components/alerts/visualization/visualization';

const GAP = 4;

export default function TargetListSection() {
  const { t } = useScopedTranslation();
  const theme = useTheme();
  const form = useFormContext<ProposalType>();
  const targets = useWatch({ control: form.control, name: 'targets' }) ?? [];
  // The edit dialog's entry is a local form, so it is not saved. The edited target can't take
  // another target's name.
  const editEntryForm = useTargetEntryForm(targets);
  const { isValid: editIsValid } = useFormState({ control: editEntryForm.control });
  const [openEditDialog, setOpenEditDialog] = React.useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [rowTarget, setRowTarget] = React.useState<TargetInput | null>(null);
  const { isSV, osdCyclePolicy } = useOSDAccessors();

  const maxTargets = osdCyclePolicy?.maxTargets ?? null;

  // The grid shows the targets in the legacy shape, so its rows are found in the form by ID
  const formTarget = (row: Target) => targets.find((rec) => rec.id === row.id) ?? null;

  const deleteIconClicked = (row: Target) => {
    setRowTarget(formTarget(row));
    setOpenDeleteDialog(true);
  };

  const closeDialog = () => {
    setOpenDeleteDialog(false);
    setOpenEditDialog(false);
  };

  const deleteConfirmed = () => {
    if (rowTarget) {
      removeTarget(form, rowTarget);
    }
    setRowTarget(null);
    closeDialog();
  };

  const editIconClicked = (row: Target) => {
    const target = formTarget(row);
    if (!target) {
      return;
    }
    editEntryForm.reset(target);
    setRowTarget(target);
    setOpenEditDialog(true);
  };

  // The edit as the schema parsed it, so its text is trimmed. An edited ICRS coordinate gets its
  // lead zero.
  const editConfirmed = () =>
    editEntryForm.handleSubmit((edited: TargetInput) => {
      const coord = edited.referenceCoordinate;
      const withLeadZero: TargetInput =
        coord.kind === REFERENCE_COORDINATE_KIND.ICRS
          ? {
              ...edited,
              referenceCoordinate: {
                ...coord,
                raStr: leadZero(coord.raStr),
                decStr: leadZero(coord.decStr)
              }
            }
          : edited;
      form.setValue(
        'targets',
        targets.map((rec) => (rec.id === withLeadZero.id ? withLeadZero : rec))
      );
      setRowTarget(null);
      closeDialog();
    })();

  const alertDeleteContent = () => {
    const LABEL_WIDTH = 6;
    const coord = rowTarget?.referenceCoordinate;
    const radialMotion = rowTarget?.radialMotion;
    // The coordinate pair of a target that has one
    const [first, second] =
      coord?.kind === REFERENCE_COORDINATE_KIND.ICRS
        ? [coord.raStr, coord.decStr]
        : coord?.kind === REFERENCE_COORDINATE_KIND.GALACTIC
          ? [coord.l, coord.b]
          : [];
    const isICRS = coord?.kind === REFERENCE_COORDINATE_KIND.ICRS;
    const isSSO = coord?.kind === REFERENCE_COORDINATE_KIND.SPECIAL;
    return (
      <Grid
        container
        sx={{
          flexDirection: 'column',
          p: 2,
          pb: 0,
          alignItems: 'center',
          justifyContent: 'space-around'
        }}
      >
        <FieldWrapper label={t('name.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rowTarget?.name}</Typography>
        </FieldWrapper>
        {!isSSO && (
          <>
            <FieldWrapper
              label={isICRS ? t('skyDirection.label.1.0') : t('skyDirection.label.1.1')}
              labelWidth={LABEL_WIDTH}
            >
              <Typography>{first}</Typography>
            </FieldWrapper>
            <FieldWrapper
              label={isICRS ? t('skyDirection.label.2.0') : t('skyDirection.label.2.1')}
              labelWidth={LABEL_WIDTH}
            >
              <Typography>{second}</Typography>
            </FieldWrapper>
            <FieldWrapper label={t('velocity.0.label')} labelWidth={LABEL_WIDTH}>
              <Typography variant="body1">
                {radialMotion?.type === RADIAL_MOTION_TYPE.VELOCITY && radialMotion.velocity.value}
              </Typography>
            </FieldWrapper>
            <FieldWrapper label={t('velocity.1.label')} labelWidth={LABEL_WIDTH}>
              <Typography variant="body1">
                {radialMotion?.type === RADIAL_MOTION_TYPE.REDSHIFT && radialMotion.redshift}
              </Typography>
            </FieldWrapper>
          </>
        )}
        <Alert
          color={AlertColorTypes.Info}
          text={t('deleteTarget.info')}
          testId="deleteTargetInfoId"
        />
      </Grid>
    );
  };

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`
    };
  }

  const [value, setValue] = React.useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // The grid and the visualisation still take the legacy shape
  const legacyTargets = legacyTargetsFromForm(targets);
  const rows = legacyTargets.map((t) => {
    const isICRS = t.kind === REFERENCE_COORDINATE_TYPE_ICRS.value;
    return {
      ...t,
      coord1: isICRS ? t.raStr : t.l,
      coord2: isICRS ? t.decStr : t.b
    };
  });

  const displayRow1 = () => {
    const isSSO = targets[0]?.referenceCoordinate.kind === REFERENCE_COORDINATE_KIND.SPECIAL;

    return (
      <Grid
        container
        direction="row"
        spacing={GAP}
        sx={{
          justifyContent: 'space-between',
          alignItems: 'top',
          height: '100%',
          width: '95vw'
        }}
      >
        <Grid
          size={{ md: 12, lg: 6 }}
          sx={{
            order: { md: 2, lg: 1 }
          }}
        >
          <Stack
            spacing={GAP}
            sx={{
              height: '100%',
              display: 'flex',
              minHeight: 0
            }}
          >
            <Box sx={{ flexShrink: 0 }}>
              <GridTargets
                deleteClicked={deleteIconClicked}
                editClicked={editIconClicked}
                height={maxTargets === 1 ? '15vh' : '60vh'}
                rows={rows}
              />
            </Box>
            {!isSSO && <Visualization target={legacyTargets[0]} show={maxTargets === 1} />}
          </Stack>
        </Grid>
        <Grid
          size={{ md: 12, lg: 6 }}
          sx={{
            order: { md: 1, lg: 2 }
          }}
        >
          <Box
            sx={{
              width: '100%',
              border: '1px solid',
              borderColor: theme.palette.primary.light,
              borderRadius: '16px'
            }}
          >
            <Tabs
              textColor="secondary"
              indicatorColor="secondary"
              value={value}
              variant="fullWidth"
              onChange={handleChange}
            >
              <Tab label={t('addTarget.label')} {...a11yProps(0)} />
              {!isSV && <Tab label={t('importFromFile.label')} {...a11yProps(1)} />}
              {!isSV && <Tab label={t('spatialImaging.label')} {...a11yProps(2)} />}
            </Tabs>
            {value === 0 && <TargetEntry textAlign="left" />}
            {value === 1 && (
              <TargetFileImport referenceCoordinateType={REFERENCE_COORDINATE_KIND.ICRS} />
            )}
            {value === 2 && <SpatialImaging />}
          </Box>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box>
      {maxTargets !== null && targets.length > maxTargets - 1 && (
        <Box
          sx={{
            pb: GAP,
            px: 10
          }}
        >
          <Alert
            color={AlertColorTypes.Warning}
            text={t(maxTargets > 1 ? 'targets.limitReached_plural' : 'targets.limitReached', {
              value: osdCyclePolicy?.maxTargets
            })}
            testId="targetLimitPanelId"
          />
        </Box>
      )}
      {displayRow1()}
      {openDeleteDialog && (
        <AlertDialog
          open={openDeleteDialog}
          onClose={closeDialog}
          onDialogResponse={deleteConfirmed}
          title="deleteTarget.label"
          disabled={false} // required attribute
        >
          {alertDeleteContent()}
        </AlertDialog>
      )}
      {openEditDialog && (
        <AlertDialog
          maxWidth="lg"
          open={openEditDialog}
          onClose={closeDialog}
          onDialogResponse={editConfirmed}
          disabled={!editIsValid}
          title="editTarget.label"
        >
          <TargetEntry entryForm={editEntryForm} target={rowTarget ? rowTarget : undefined} />
        </AlertDialog>
      )}
    </Box>
  );
}
