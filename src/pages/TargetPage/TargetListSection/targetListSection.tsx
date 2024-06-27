/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/no-array-index-key */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Tab, Tabs, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes, DataGrid } from '@ska-telescope/ska-gui-components';
import { Proposal } from '../../../utils/types/proposal';
import TargetFileImport from './TargetFileImport/TargetFileImport';
import SpatialImaging from './SpatialImaging/SpatialImaging';
import EditIcon from '../../../components/icon/editIcon/editIcon';
import TrashIcon from '../../../components/icon/trashIcon/trashIcon';
import Alert from '../../../components/alerts/standardAlert/StandardAlert';
import AlertDialog from '../../../components/alerts/alertDialog/AlertDialog';
import FieldWrapper from '../../../components/wrappers/fieldWrapper/FieldWrapper';
import TargetEntry from '../../../components/targetEntry/TargetEntry';
import ReferenceCoordinatesField from '../../../components/fields/referenceCoordinates/ReferenceCoordinates';
import { RA_TYPE_EQUATORIAL } from '../../../utils/constants';
import Target from '../../../utils/types/target';

export default function TargetListSection() {
  const { t } = useTranslation('pht');
  const { application, updateAppContent2 } = storageObject.useStore();
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [openEditDialog, setOpenEditDialog] = React.useState(false);
  const [currentTarget, setCurrentTarget] = React.useState(0);
  const [newTarget, setNewTarget] = React.useState(null);
  const [raType, setRAType] = React.useState(RA_TYPE_EQUATORIAL);

  React.useEffect(() => {
    initNewTarget()
  }, []);

  const initNewTarget = () => {
    const rec:Target = {
      dec: '',
      decUnit: '',
      id: 0,
      name: '',
      latitude: '',
      longitude: '',
      ra: '',
      raUnit: '',
      redshift: '',
      referenceFrame: 0,
      vel: '',
      velType: 0,
      velUnit: ''
    }
    setNewTarget(rec);
  }

  const deleteIconClicked = () => {
    setOpenDeleteDialog(true);
  };

  const closeDialog = () => {
    setOpenDeleteDialog(false);
    setOpenEditDialog(false);
  };

  const deleteConfirmed = () => {
    const obs1 = getProposal().targets.filter(e => e.id !== currentTarget);
    const obs2 = getProposal().targetObservation.filter(e => e.targetId !== currentTarget);
    setProposal({ ...getProposal(), targets: obs1, targetObservation: obs2 });
    setCurrentTarget(0);
    closeDialog();
  };

  const editIconClicked = async () => {
    setOpenEditDialog(true);
  };
  
  const editConfirmed = () => {
    const obs1 = getProposal().targets.map(e => e.id === newTarget.id ? newTarget : e);
    setProposal({ ...getProposal(), targets: obs1 });
    setCurrentTarget(0);
    closeDialog();
  };

  const alertContent = () => {
    const LABEL_WIDTH = 6;
    const rec = getProposal().targets.find(p => p.id === currentTarget);
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
        <FieldWrapper label={t('velocity.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec.vel}</Typography>
        </FieldWrapper>

        <Grid pt={3} container direction="row" alignItems="center" justifyContent="space-around">
          <Grid item>
            <Typography variant="caption">{t('deleteTarget.content1')}</Typography>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const columns = [
    { field: 'name', headerName: t('name.label'), width: 200 },
    { field: 'ra', headerName: t('skyDirection.label.1.' + raType), width: 150 },
    { field: 'dec', headerName: t('skyDirection.label.2.' + raType), width: 150 },
    { field: 'vel', headerName: t('velocity.1'), width: 100 },
    {
      field: 'id',
      headerName: t('actions.label'),
      sortable: false,
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: () => (
        <>
          <EditIcon
            onClick={() => editIconClicked()}
            toolTip={t('editTarget.toolTip')} />
          <TrashIcon onClick={deleteIconClicked} toolTip={t('deleteTarget.toolTip')} />
        </>
      )
    }
  ];
  const extendedColumns = [...columns];

  const ClickTargetRow = (e: { id: number }) => {
    setCurrentTarget(e.id);
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

  const RefOptions = () => {
    const GRID_OFFSET = 1;
    const GRID_WIDTH = 4;
    const LAB_WIDTH = 5;
    return (
      <>
        <Grid item md={GRID_OFFSET} xs={0}></Grid>
        <Grid item md={GRID_WIDTH} xs={11}>
          <ReferenceCoordinatesField labelWidth={LAB_WIDTH} setValue={setRAType} value={raType} />
        </Grid>
        <Grid item md={12 - GRID_OFFSET - GRID_WIDTH} xs={0}></Grid>
      </>
    );
  };

  return (
    <Grid container direction="row" alignItems="space-evenly" justifyContent="space-evenly">
      {RefOptions()}
      <Grid item md={5} xs={11}>
        {getProposal().targets.length > 0 && (
          <DataGrid
            rows={getProposal().targets}
            columns={extendedColumns}
            height={400}
            onRowClick={ClickTargetRow}
            testId="targetListColumns"
          />
        )}
        {getProposal().targets.length === 0 && (
          <Alert color={AlertColorTypes.Error} text={t('targets.empty')} testId="helpPanelId" />
        )}
      </Grid>
      <Grid item md={6} xs={11}>
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
          {value === 0 && <TargetEntry raType={raType} setTarget={setNewTarget} target={newTarget} />}
          {value === 1 && <TargetFileImport raType={raType} />}
          {value === 2 && <SpatialImaging />}
        </Box>
      </Grid>
      {openDeleteDialog && (
        <AlertDialog
          open={openDeleteDialog}
          onClose={() => closeDialog()}
          onDialogResponse={deleteConfirmed}
          title="deleteTarget.label"
        >
          {alertContent()}
        </AlertDialog>
      )}
      {openEditDialog && (
        <AlertDialog
          open={openEditDialog}
          onClose={() => closeDialog()}
          onDialogResponse={editConfirmed}
          maxWidth='lg'
          title="editTarget.label"
        >
          {<TargetEntry id={getProposal().targets.find(p => p.id === currentTarget).id} raType={raType} setTarget={setNewTarget} target={newTarget} />}
        </AlertDialog>
      )}
    </Grid>
  );
}
