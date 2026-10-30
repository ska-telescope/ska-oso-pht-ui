import React from 'react';
import { Box, Grid, Stack, Tab, Tabs, Typography, useTheme } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import { ProposalType } from '@/models/proposals/proposal';
import {
  applyTargetEdit,
  targetEntryFromTarget,
  TargetEntryType,
  useTargetEntryForm
} from '@/models/proposals/targetEntry';
import { REFERENCE_COORDINATE_TYPE_ICRS, REFERENCE_COORDINATE_TYPE_SSO } from '@utils/constants.ts';
import deleteAutoLinking from '@utils/autoLinking/DeleteAutoLinking.tsx';
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
  const targets = (useWatch({ control: form.control, name: 'targets' }) ?? []) as Target[];
  // The edit dialog's entry is a local form, so it is not saved; editStartRef holds the entry as the
  // dialog opened with it, so only the fields the user changes are applied
  const editEntryForm = useTargetEntryForm();
  const editStartRef = React.useRef<TargetEntryType | null>(null);
  const [openEditDialog, setOpenEditDialog] = React.useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [rowTarget, setRowTarget] = React.useState<Target | null>(null);
  const [skyDirection1Error, setSkyDirection1Error] = React.useState('');
  const [skyDirection2Error, setSkyDirection2Error] = React.useState('');
  const [nameError, setNameError] = React.useState('');
  const { autoLink, isSV, osdCyclePolicy } = useOSDAccessors();

  const maxTargets = osdCyclePolicy?.maxTargets ?? null;

  const deleteIconClicked = (e: Target) => {
    setRowTarget(e);
    setOpenDeleteDialog(true);
  };

  const closeDialog = () => {
    setOpenDeleteDialog(false);
    setOpenEditDialog(false);
  };

  const deleteConfirmed = () => {
    if (autoLink) {
      deleteAutoLinking(rowTarget as Target, form);
    } else {
      const targetObservation = form.getValues('targetObservation') ?? [];
      const obsId = targetObservation.find((e) => e.targetId === rowTarget?.id)?.observationId;
      form.setValue(
        'targets',
        targets.filter((e) => e.id !== rowTarget?.id)
      );
      form.setValue(
        'targetObservation',
        targetObservation.filter((e) => e.targetId !== rowTarget?.id)
      );
      form.setValue(
        'calibrationStrategy',
        (form.getValues('calibrationStrategy') ?? []).filter((e) => e.observationIdRef !== obsId)
      );
    }
    setRowTarget(null);
    closeDialog();
  };

  const editIconClicked = (e: Target) => {
    const entry = targetEntryFromTarget(e);
    editStartRef.current = entry;
    editEntryForm.reset(entry);
    setRowTarget(e);
    setOpenEditDialog(true);
  };

  const editConfirmed = () => {
    if (rowTarget && editStartRef.current) {
      const edited = applyTargetEdit(rowTarget, editStartRef.current, editEntryForm.getValues());
      form.setValue(
        'targets',
        targets.map((rec) => (rec.id === edited.id ? edited : rec))
      );
    }
    setRowTarget(null);
    closeDialog();
  };

  const alertDeleteContent = () => {
    const LABEL_WIDTH = 6;
    const rec = targets.find((p) => p.id === rowTarget?.id);
    const isICRS = rec?.kind === REFERENCE_COORDINATE_TYPE_ICRS.value;
    const isSSO = rec?.kind === REFERENCE_COORDINATE_TYPE_SSO.value;
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
          <Typography variant="body1">{rec?.name}</Typography>
        </FieldWrapper>
        {!isSSO && (
          <>
            <FieldWrapper
              label={isICRS ? t('skyDirection.label.1.0') : t('skyDirection.label.1.1')}
              labelWidth={LABEL_WIDTH}
            >
              <Typography>{isICRS ? rec?.raStr : rec?.l}</Typography>
            </FieldWrapper>
            <FieldWrapper
              label={isICRS ? t('skyDirection.label.2.0') : t('skyDirection.label.2.1')}
              labelWidth={LABEL_WIDTH}
            >
              <Typography>{isICRS ? rec?.decStr : rec?.b}</Typography>
            </FieldWrapper>
            <FieldWrapper label={t('velocity.0.label')} labelWidth={LABEL_WIDTH}>
              <Typography variant="body1">{rec?.vel}</Typography>
            </FieldWrapper>
            <FieldWrapper label={t('velocity.1.label')} labelWidth={LABEL_WIDTH}>
              <Typography variant="body1">{rec?.redshift}</Typography>
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

  const rows = targets.map((t) => {
    const isICRS = t.kind === REFERENCE_COORDINATE_TYPE_ICRS.value;
    return {
      ...t,
      coord1: isICRS ? t.raStr : t.l,
      coord2: isICRS ? t.decStr : t.b
    };
  });

  const displayRow1 = () => {
    const target = targets[0];
    const isSSO = target?.kind === REFERENCE_COORDINATE_TYPE_SSO.value;

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
            {!isSSO && <Visualization target={targets[0] ?? undefined} show={maxTargets === 1} />}
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
              <TargetFileImport referenceCoordinateType={REFERENCE_COORDINATE_TYPE_ICRS.value} />
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
          disabled={!!skyDirection1Error || !!skyDirection2Error || !!nameError}
          title="editTarget.label"
        >
          <TargetEntry
            entryForm={editEntryForm}
            target={rowTarget ? rowTarget : undefined}
            onCoord1FieldErrorChange={setSkyDirection1Error} // Pass callback
            onCoord2FieldErrorChange={setSkyDirection2Error} // Pass callback
            onNameFieldErrorChange={setNameError} // Pass callback
          />
        </AlertDialog>
      )}
    </Box>
  );
}
