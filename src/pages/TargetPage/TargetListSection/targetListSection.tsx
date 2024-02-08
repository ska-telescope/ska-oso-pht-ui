/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/no-array-index-key */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Tab, Tabs, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { DataGrid, InfoCard, InfoCardColorTypes } from '@ska-telescope/ska-gui-components';
import { Proposal } from '../../../services/types/proposal';
import TargetFileImport from './TargetFileImport/TargetFileImport';
import SpatialImaging from './SpatialImaging/SpatialImaging';
import AddTarget from './AddTarget/AddTarget';
import TrashIcon from '../../../components/icon/trashIcon/trashIcon';
import AlertDialog from '../../../components/alerts/alertDialog/AlertDialog';
import FieldWrapper from '../../../components/wrappers/fieldWrapper/FieldWrapper';

export default function TargetListSection() {
  const { t } = useTranslation('pht');
  const { application, updateAppContent2 } = storageObject.useStore();
  const [openDialog, setOpenDialog] = React.useState(false);
  const [currentTarget, setCurrentTarget] = React.useState(0);

  const getRows = () => getProposal().targets;

  const deleteIconClicked = () => {
    setOpenDialog(true);
  };

  const closeDeleteDialog = () => {
    setOpenDialog(false);
  };

  const deleteConfirmed = () => {
    const obs1 = getProposal().targets.filter(e => e.id !== currentTarget);
    const obs2 = getProposal().targetObservation.filter(e => e.targetId !== currentTarget);
    setProposal({ ...getProposal(), targets: obs1, targetObservation: obs2 });
    setCurrentTarget(0);
    closeDeleteDialog();
  };

  const alertContent = () => {
    const LABEL_WIDTH = 6;
    const rec = getProposal().targets.find(p => p.id === currentTarget);
    return (
      <Grid p={2} container direction="column" alignItems="center" justifyContent="space-around">
        <FieldWrapper label={t('name.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec.name}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('rightAscension.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec.ra}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('declination.label')} labelWidth={LABEL_WIDTH}>
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
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'ra', headerName: 'Right Ascension', width: 150 },
    { field: 'dec', headerName: 'Declination', width: 100 },
    { field: 'vel', headerName: 'Red Shift', width: 100 },
    {
      field: 'id',
      headerName: 'Actions',
      sortable: false,
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: () => <TrashIcon onClick={deleteIconClicked} toolTip="Delete target" />
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

  return (
    <Grid container direction="row" alignItems="space-evenly" justifyContent="space-evenly">
      <Grid item md={5} xs={11}>
        {getRows().length > 0 && (
          <DataGrid
            rows={getProposal().targets}
            columns={extendedColumns}
            height={400}
            onRowClick={ClickTargetRow}
            showBorder={false}
            showMild
            testId="targetListColumns"
          />
        )}
        {getRows().length === 0 && (
          <InfoCard
            color={InfoCardColorTypes.Error}
            fontSize={20}
            message={t('targets.empty')}
            testId="helpPanelId"
          />
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
                label={t('label.addTarget')}
                {...a11yProps(0)}
                sx={{ border: '1px solid grey' }}
              />
              <Tab
                label={t('label.importFromFile')}
                {...a11yProps(1)}
                sx={{ border: '1px solid grey' }}
                disabled
              />
              <Tab
                label={t('label.spatialImaging')}
                {...a11yProps(2)}
                sx={{ border: '1px solid grey' }}
                disabled
              />
            </Tabs>
          </Box>
          {value === 0 && <AddTarget />}
          {value === 1 && <TargetFileImport />}
          {value === 2 && <SpatialImaging />}
        </Box>
      </Grid>
      {openDialog && (
        <AlertDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onDialogResponse={deleteConfirmed}
          title="deleteTarget.label"
        >
          {alertContent()}
        </AlertDialog>
      )}
    </Grid>
  );
}
