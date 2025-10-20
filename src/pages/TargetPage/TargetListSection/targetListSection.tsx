import React from 'react';
import { Box, Grid, Tab, Tabs, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import { Proposal } from '@utils/types/proposal.tsx';
import { RA_TYPE_ICRS, VELOCITY_TYPE, WRAPPER_HEIGHT } from '@utils/constants.ts';
import TargetEntry from '../../entry/TargetEntry/TargetEntry';
import Alert from '../../../components/alerts/standardAlert/StandardAlert';
import AlertDialog from '../../../components/alerts/alertDialog/AlertDialog';
import FieldWrapper from '../../../components/wrappers/fieldWrapper/FieldWrapper';
import Target from '../../../utils/types/target';
import GridTargets from '../../../components/grid/targets/GridTargets';
import SpatialImaging from './SpatialImaging/SpatialImaging';
import TargetFileImport from './TargetFileImport/TargetFileImport';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

const DATA_GRID_HEIGHT = '55vh';
const TARGET_ENTRY_HEIGHT = '60vh';
const WRAPPER_WIDTH = '500px';

export default function TargetListSection() {
  const { t } = useScopedTranslation();
  const { application, updateAppContent2 } = storageObject.useStore();
  const [openEditDialog, setOpenEditDialog] = React.useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [rowTarget, setRowTarget] = React.useState<Target | null>(null);

  const deleteIconClicked = (e: Target) => {
    setRowTarget(e);
    setOpenDeleteDialog(true);
  };

  const closeDialog = () => {
    setOpenDeleteDialog(false);
    setOpenEditDialog(false);
  };

  const deleteConfirmed = () => {
    const obs1 = getProposal().targets?.filter(e => e.id !== rowTarget?.id);
    const obs2 = getProposal().targetObservation?.filter(e => e.targetId !== rowTarget?.id);
    setProposal({ ...getProposal(), targets: obs1, targetObservation: obs2 });
    setRowTarget(null);
    closeDialog();
  };

  const editIconClicked = (e: Target) => {
    setRowTarget(e);
    setOpenEditDialog(true);
  };

  const editConfirmed = () => {
    if (rowTarget && rowTarget.velType === VELOCITY_TYPE.VELOCITY) {
      rowTarget.redshift = '';
    } else if (rowTarget) {
      rowTarget.vel = '';
    }
    const obs1 = getProposal().targets?.map(rec => {
      return rec.id === rowTarget?.id ? rowTarget : rec;
    });
    setProposal({ ...getProposal(), targets: obs1 });
    setRowTarget(null);
    closeDialog();
  };

  const alertDeleteContent = () => {
    const LABEL_WIDTH = 6;
    const rec = getProposal()?.targets?.find(p => p.id === rowTarget?.id);
    return (
      <Grid
        p={2}
        pb={0}
        container
        direction="column"
        alignItems="center"
        justifyContent="space-around"
      >
        <FieldWrapper label={t('name.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec?.name}</Typography>
        </FieldWrapper>
        <FieldWrapper
          label={t('skyDirection.label.1.' + RA_TYPE_ICRS.value)}
          labelWidth={LABEL_WIDTH}
        >
          <Typography variant="body1">{rec?.raStr}</Typography>
        </FieldWrapper>
        <FieldWrapper
          label={t('skyDirection.label.2.' + RA_TYPE_ICRS.value)}
          labelWidth={LABEL_WIDTH}
        >
          <Typography variant="body1">{rec?.decStr}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('velocity.0')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec?.vel}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('velocity.1')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec?.redshift}</Typography>
        </FieldWrapper>

        <Alert
          color={AlertColorTypes.Info}
          text={t('deleteTarget.info')}
          testId="deleteTargetInfoId"
        />
      </Grid>
    );
  };

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

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

  const fieldWrapper = (children?: React.JSX.Element) => (
    <Box p={0} pt={1} sx={{ height: WRAPPER_HEIGHT, width: WRAPPER_WIDTH }}>
      {children}
    </Box>
  );

  const emptyField = () => {
    return <Grid>{fieldWrapper()}</Grid>;
  };

  const displayRow1 = () => {
    return (
      <Grid
        p={1}
        container
        direction="row"
        justifyContent="space-between"
        alignItems="centre"
        spacing={4}
        sx={{ height: '60vh', width: '95vw' }}
      >
        <Grid size={{ md: 12, lg: 6 }} order={{ md: 2, lg: 1 }}>
          {emptyField()}
          <GridTargets
            deleteClicked={deleteIconClicked}
            editClicked={editIconClicked}
            height={DATA_GRID_HEIGHT}
            raType={RA_TYPE_ICRS.value}
            rows={getProposal().targets}
          />
        </Grid>
        <Grid size={{ md: 12, lg: 6 }} order={{ md: 1, lg: 2 }}>
          <Box
            sx={{
              width: '100%',
              height: TARGET_ENTRY_HEIGHT,
              border: '1px solid grey'
            }}
          >
            <Tabs
              textColor="secondary"
              indicatorColor="secondary"
              value={value}
              variant="fullWidth"
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              <Tab
                label={t('addTarget.label')}
                {...a11yProps(0)}
                sx={{ border: '1px solid grey', width: '100%' }}
              />
              <Tab
                label={t('importFromFile.label')}
                {...a11yProps(1)}
                sx={{ border: '1px solid grey', width: '100%' }}
              />
              <Tab
                label={t('spatialImaging.label')}
                {...a11yProps(2)}
                sx={{ border: '1px solid grey', width: '100%' }}
              />
            </Tabs>
            {value === 0 && <TargetEntry raType={RA_TYPE_ICRS.value} textAlign="left" />}
            {value === 1 && <TargetFileImport raType={RA_TYPE_ICRS.value} />}
            {value === 2 && <SpatialImaging />}
          </Box>
        </Grid>
      </Grid>
    );
  };

  return (
    <Grid container direction="row" alignItems="space-evenly" justifyContent="space-evenly">
      {displayRow1()}
      {openDeleteDialog && (
        <AlertDialog
          open={openDeleteDialog}
          onClose={closeDialog}
          onDialogResponse={deleteConfirmed}
          title="deleteTarget.label"
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
          title="editTarget.label"
        >
          <TargetEntry
            raType={RA_TYPE_ICRS.value}
            setTarget={setRowTarget}
            target={rowTarget ? rowTarget : undefined}
            showBeamData={!!rowTarget?.tiedArrayBeams?.pstBeams}
          />
        </AlertDialog>
      )}
    </Grid>
  );
}
