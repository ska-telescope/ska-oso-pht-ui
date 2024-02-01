/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/no-array-index-key */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Tab, Tabs } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { DataGrid } from '@ska-telescope/ska-gui-components';
import { Proposal } from '../../../services/types/proposal';
import TargetFileImport from './TargetFileImport/TargetFileImport';
import SpatialImaging from './SpatialImaging/SpatialImaging';
import AddTarget from './AddTarget/AddTarget';
import TrashIcon from '../../../components/icon/trashIcon/trashIcon';

export default function TargetListSection() {
  const { t } = useTranslation('pht');
  const { application } = storageObject.useStore();

  const deleteIconClicked = () => {
    // TODO : Display confirmation and if confirm, delete
  };

  const getProposal = () => application.content2 as Proposal;

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

  const ClickFunction = () => {
    // TODO
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
        <DataGrid
          rows={getProposal().targets}
          columns={extendedColumns}
          height={400}
          onRowClick={ClickFunction}
          showBorder={false}
          testId="targetListColumns"
        />
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
    </Grid>
  );
}
