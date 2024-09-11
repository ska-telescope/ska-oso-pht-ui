import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Tab, Tabs, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes, DataGrid } from '@ska-telescope/ska-gui-components';
import { Proposal } from '../../../utils/types/proposal';
import TargetFileImport from './TargetFileImport/TargetFileImport';
import SpatialImaging from './SpatialImaging/SpatialImaging';
import TargetEntry from '../../../components/targetEntry/TargetEntry';
import EditIcon from '../../../components/icon/editIcon/editIcon';
import TrashIcon from '../../../components/icon/trashIcon/trashIcon';
import Alert from '../../../components/alerts/standardAlert/StandardAlert';
import AlertDialog from '../../../components/alerts/alertDialog/AlertDialog';
import FieldWrapper from '../../../components/wrappers/fieldWrapper/FieldWrapper';
import ReferenceCoordinatesField from '../../../components/fields/referenceCoordinates/ReferenceCoordinates';
import { RA_TYPE_EQUATORIAL, VELOCITY_TYPE } from '../../../utils/constants';
import Target, { NEW_TARGET } from '../../../utils/types/target';

const DATA_GRID_HEIGHT = 400;

export default function TargetListSection() {
  const { t } = useTranslation('pht');
  const { application, updateAppContent2 } = storageObject.useStore();
  const [openEditDialog, setOpenEditDialog] = React.useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [newTarget, setNewTarget] = React.useState(NEW_TARGET);
  const [rowTarget, setRowTarget] = React.useState(null);
  const [raType, setRAType] = React.useState(RA_TYPE_EQUATORIAL);

  React.useEffect(() => {
    initTarget();
  }, []);

  const initTarget = () => {
    setNewTarget(NEW_TARGET);
  };

  const deleteIconClicked = (e: Target) => {
    setRowTarget(e);
    setOpenDeleteDialog(true);
  };

  const closeDialog = () => {
    setOpenDeleteDialog(false);
    setOpenEditDialog(false);
  };

  const deleteConfirmed = () => {
    const obs1 = getProposal().targets.filter(e => e.id !== rowTarget.id);
    const obs2 = getProposal().targetObservation.filter(e => e.targetId !== rowTarget.id);
    setProposal({ ...getProposal(), targets: obs1, targetObservation: obs2 });
    setRowTarget(null);
    closeDialog();
  };

  const editIconClicked = (e: Target) => {
    setRowTarget(e);
    setOpenEditDialog(true);
  };

  const editConfirmed = () => {
    if (rowTarget.velType === VELOCITY_TYPE.VELOCITY) {
      rowTarget.redshift = '';
    } else {
      rowTarget.vel = '';
    }
    const obs1 = getProposal().targets.map(rec => {
      return rec.id === rowTarget.id ? rowTarget : rec;
    });
    setProposal({ ...getProposal(), targets: obs1 });
    setRowTarget(null);
    closeDialog();
  };

  const alertDeleteContent = () => {
    const LABEL_WIDTH = 6;
    const rec = getProposal().targets.find(p => p.id === rowTarget.id);
    return (
      <Grid p={2} container direction="column" alignItems="center" justifyContent="space-around">
        <FieldWrapper label={t('name.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec.name}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('skyDirection.label.1.' + raType)} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec.ra}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('skyDirection.label.2.' + raType)} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec.dec}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('velocity.0')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec.vel}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('velocity.1')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec.redshift}</Typography>
        </FieldWrapper>

        <Grid pt={3} container direction="row" alignItems="center" justifyContent="space-around">
          <Grid item>
            <Typography variant="caption">{t('deleteTarget.content1')}</Typography>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  const alertEditContent = () => {
    return (
      <TargetEntry id={rowTarget.id} raType={raType} setTarget={setRowTarget} target={rowTarget} />
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

  const RefOptions = () => {
    const GRID_OFFSET = 2;
    const LAB_WIDTH = 7;
    return (
      <>
        <Grid item md={GRID_OFFSET} xs={0}></Grid>
        <Grid item md={5} lg={3}>
          <ReferenceCoordinatesField labelWidth={LAB_WIDTH} setValue={setRAType} value={raType} />
        </Grid>
        <Grid item md={GRID_OFFSET} xs={0}></Grid>
      </>
    );
  };

  const displayGrid = () => {
    const extendedColumns = [
      ...[
        { field: 'name', headerName: t('name.label'), flex: 3 },
        { field: 'ra', headerName: t('skyDirection.label.1.' + raType), flex: 3 },
        { field: 'dec', headerName: t('skyDirection.label.2.' + raType), flex: 3 },
        {
          field: 'vel',
          headerName: t('velocity.0'),
          flex: 2,
          disableClickEventBubbling: true,
          renderCell: (e: { row: Target }) => {
            if (e.row.vel === null || e.row.vel === '') {
              return null;
            }
            const units = e.row.velUnit === 1 ? 1 : 0;
            return e.row.vel + ' ' + t('velocity.units.' + units);
          }
        },
        { field: 'redshift', headerName: t('velocity.1'), flex: 2 },
        {
          field: 'actions',
          type: 'actions',
          headerName: t('actions.label'),
          sortable: false,
          flex: 2,
          disableClickEventBubbling: true,
          renderCell: (e: any) => {
            const rec: Target = e.row;
            return (
              <>
                <EditIcon onClick={() => editIconClicked(rec)} toolTip={t('editTarget.toolTip')} />
                <TrashIcon
                  onClick={() => deleteIconClicked(rec)}
                  toolTip={t('deleteTarget.toolTip')}
                />
              </>
            );
          }
        }
      ]
    ];

    return (
      <>
        {getProposal().targets.length > 0 && (
          <DataGrid
            rows={getProposal().targets}
            columns={extendedColumns}
            height={DATA_GRID_HEIGHT}
            testId="targetListColumns"
          />
        )}
        {getProposal().targets.length === 0 && (
          <Alert color={AlertColorTypes.Error} text={t('targets.empty')} testId="helpPanelId" />
        )}
      </>
    );
  };

  const displayRow1 = () => {
    return (
      <Grid
        container
        direction="row"
        alignItems="space-evenly"
        justifyContent="space-evenly"
        display={{ md: 'none', lg: 'flex' }}
      >
        <Grid item lg={5}>
          {displayGrid()}
        </Grid>
        <Grid item lg={6}>
          <Box sx={{ width: '100%', border: '1px solid grey' }}>
            <Box>
              <Tabs
                textColor="secondary"
                indicatorColor="secondary"
                value={value}
                onChange={handleChange}
                aria-label="basic tabs example"
              >
                <Tab
                  label={t('addTarget.label')}
                  {...a11yProps(0)}
                  sx={{ border: '1px solid grey' }}
                />
                <Tab
                  label={t('importFromFile.label')}
                  {...a11yProps(1)}
                  sx={{ border: '1px solid grey' }}
                />
                <Tab
                  label={t('spatialImaging.label')}
                  {...a11yProps(2)}
                  sx={{ border: '1px solid grey' }}
                  disabled
                />
              </Tabs>
            </Box>
            {value === 0 && (
              <TargetEntry raType={raType} setTarget={setNewTarget} target={newTarget} />
            )}
            {value === 1 && <TargetFileImport raType={raType} />}
            {value === 2 && <SpatialImaging />}
          </Box>
        </Grid>
      </Grid>
    );
  };

  const displayRow2 = () => {
    return (
      <Grid item md={11} display={{ md: 'block', lg: 'none' }}>
        <Box sx={{ width: '100%', border: '1px solid grey' }}>
          <Box>
            <Tabs
              textColor="secondary"
              indicatorColor="secondary"
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              <Tab
                label={t('addTarget.label')}
                {...a11yProps(0)}
                sx={{ border: '1px solid grey' }}
              />
              <Tab
                label={t('importFromFile.label')}
                {...a11yProps(1)}
                sx={{ border: '1px solid grey' }}
              />
              <Tab
                label={t('spatialImaging.label')}
                {...a11yProps(2)}
                sx={{ border: '1px solid grey' }}
                disabled
              />
            </Tabs>
          </Box>
          {value === 0 && (
            <TargetEntry raType={raType} setTarget={setNewTarget} target={newTarget} />
          )}
          {value === 1 && <TargetFileImport raType={raType} />}
          {value === 2 && <SpatialImaging />}
        </Box>
      </Grid>
    );
  };

  const displayRow3 = () => {
    return (
      <Grid item sx={{ width: '90vw' }} display={{ md: 'block', lg: 'none' }}>
        {displayGrid()}
      </Grid>
    );
  };

  return (
    <Grid container direction="row" alignItems="space-evenly" justifyContent="space-evenly">
      {RefOptions()}
      {displayRow1()}
      {displayRow2()}
      {displayRow3()}
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
          {alertEditContent()}
        </AlertDialog>
      )}
    </Grid>
  );
}
