/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/no-array-index-key */

import React from 'react';
import { Box, Grid, Tab, Tabs } from '@mui/material';
import DataGridWrapper from '../../../../components/wrappers/dataGridWrapper/dataGridWrapper';
import { Help } from '../../../../services/types/help';
import { Proposal } from '../../../../services/types/proposal';
import TargetFileImport from './TargetFileImport/TargetFileImport';
import SpatialImaging from './SpatialImaging/SpatialImaging';
import AddTarget from './AddTarget/AddTarget';

interface TargetListSectionProps {
  help: Help;
  proposal: Proposal;
  setHelp: Function;
  setProposal: Function;
}

export default function TargetListSection({
  help,
  proposal,
  setHelp,
  setProposal
}: TargetListSectionProps) {
  const columns = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'ra', headerName: 'Right Ascension', width: 150 },
    { field: 'dec', headerName: 'Declination', width: 150 }
  ];
  const extendedColumns = structuredClone(columns);

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
        <DataGridWrapper
          rows={proposal.targets}
          extendedColumns={extendedColumns}
          height={400}
          rowClick={ClickFunction}
        />
      </Grid>
      <Grid item md={6} xs={11}>
        <Box sx={{ width: '100%', border: '1px solid grey', borderTop: 'none' }}>
          <Box>
            <Box>
              <Tabs
                textColor="secondary"
                indicatorColor="secondary"
                value={value}
                onChange={handleChange}
                aria-label="basic tabs example"
              >
                <Tab label="Add Target" {...a11yProps(0)} sx={{ border: '1px solid grey' }} />
                <Tab
                  label="Import From File"
                  {...a11yProps(1)}
                  sx={{ border: '1px solid grey' }}
                  disabled
                />
                <Tab
                  label="Spatial Imaging"
                  {...a11yProps(2)}
                  sx={{ border: '1px solid grey' }}
                  disabled
                />
              </Tabs>
            </Box>
            {value === 0 && (
              <AddTarget
                help={help}
                proposal={proposal}
                setHelp={setHelp}
                setProposal={setProposal}
              />
            )}
            {value === 1 && <TargetFileImport />}
            {value === 2 && <SpatialImaging />}
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
