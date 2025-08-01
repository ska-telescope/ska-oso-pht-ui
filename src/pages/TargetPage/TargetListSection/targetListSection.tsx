import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid2, Tab, Tabs, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes, Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import { Proposal } from '../../../utils/types/proposal';
import TargetEntry from '../../entry/TargetEntry/TargetEntry';
import Alert from '../../../components/alerts/standardAlert/StandardAlert';
import AlertDialog from '../../../components/alerts/alertDialog/AlertDialog';
import FieldWrapper from '../../../components/wrappers/fieldWrapper/FieldWrapper';
import ReferenceCoordinatesField from '../../../components/fields/referenceCoordinates/ReferenceCoordinates';
import {
  FOOTER_SPACER,
  RA_TYPE_EQUATORIAL,
  VELOCITY_TYPE,
  WRAPPER_HEIGHT
} from '../../../utils/constants';
import Target from '../../../utils/types/target';
import GridTargets from '../../../components/grid/targets/GridTargets';
import SpatialImaging from './SpatialImaging/SpatialImaging';
import TargetFileImport from './TargetFileImport/TargetFileImport';

const DATA_GRID_HEIGHT = '50vh';
const WRAPPER_WIDTH = '500px';

export default function TargetListSection() {
  const { t } = useTranslation('pht');
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
      <Grid2
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
          label={t('skyDirection.label.1.' + RA_TYPE_EQUATORIAL)}
          labelWidth={LABEL_WIDTH}
        >
          <Typography variant="body1">{rec?.ra}</Typography>
        </FieldWrapper>
        <FieldWrapper
          label={t('skyDirection.label.2.' + RA_TYPE_EQUATORIAL)}
          labelWidth={LABEL_WIDTH}
        >
          <Typography variant="body1">{rec?.dec}</Typography>
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
      </Grid2>
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
    return <Grid2>{fieldWrapper()}</Grid2>;
  };

  const referenceCoordinatesField = () => {
    return (
      <Grid2>
        {fieldWrapper(
          <Box pt={1}>
            <ReferenceCoordinatesField
              labelWidth={6}
              setValue={undefined}
              value={RA_TYPE_EQUATORIAL}
            />
          </Box>
        )}
      </Grid2>
    );
  };

  const displayRow1 = () => {
    return (
      <Grid2 container direction="row" alignItems="space-evenly" justifyContent="space-evenly">
        <Grid2 size={{ md: 12, lg: 5 }} order={{ md: 2, lg: 1 }}>
          {emptyField()}
          <GridTargets
            deleteClicked={deleteIconClicked}
            editClicked={editIconClicked}
            height={DATA_GRID_HEIGHT}
            raType={RA_TYPE_EQUATORIAL}
            rows={getProposal().targets}
          />
        </Grid2>
        <Grid2 size={{ md: 12, lg: 6 }} order={{ md: 1, lg: 2 }}>
          {referenceCoordinatesField()}
          <Box sx={{ width: '100%', border: '1px solid grey' }}>
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
            {value === 0 && <TargetEntry raType={RA_TYPE_EQUATORIAL} />}
            {value === 1 && <TargetFileImport raType={RA_TYPE_EQUATORIAL} />}
            {value === 2 && <SpatialImaging />}
          </Box>
        </Grid2>
      </Grid2>
    );
  };

  return (
    <Grid2 container direction="row" alignItems="space-evenly" justifyContent="space-evenly">
      {displayRow1()}
      <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
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
            raType={RA_TYPE_EQUATORIAL}
            setTarget={setRowTarget}
            target={rowTarget ? rowTarget : undefined}
          />
        </AlertDialog>
      )}
    </Grid2>
  );
}
