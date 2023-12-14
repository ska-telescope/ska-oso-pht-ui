/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/no-array-index-key */

import React from 'react';
import { Box, Grid, Tab, Tabs, Typography, TextField } from '@mui/material';
import DataGridWrapper from '../../../../components/wrappers/dataGridWrapper/dataGridWrapper';
import AddTargetButton from '../../../../components/button/AddTarget/AddTargetButton';
import InfoPanel from '../../../../components/infoPanel/infoPanel';
import { TARGETS } from '../../../../utils/constants';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export default function TargetListSection() {
  const columns = [
    { field: 'Name', headerName: 'Name', width: 200 },
    { field: 'RA', headerName: 'Right Ascension', width: 200 },
    { field: 'Dec', headerName: 'Declination', width: 300 }
  ];
  const extendedColumns = structuredClone(columns);

  const ClickFunction = () => {
    // TODO
  };

  function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

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

  const [inputs] = React.useState(
    TARGETS.ListOfTargets.AddTarget.map((value: string) => ({ label: value }))
  );

  return (
    <Grid container direction="row" alignItems="space-evenly" justifyContent="space-evenly">
      <Grid item>
        <DataGridWrapper
          rows={TARGETS.ListOfTargets.TargetItems}
          extendedColumns={extendedColumns}
          height={400}
          rowClick={ClickFunction}
        />
      </Grid>
      <Grid item>
        <Box sx={{ width: '100%', border: '1px solid grey', borderTop: 'none' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'grey' }}>
            <Tabs
              textColor="secondary"
              indicatorColor="secondary"
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              <Tab label="Add Target" {...a11yProps(0)} sx={{ border: '1px solid grey' }} />
              <Tab label="Import From File" {...a11yProps(1)} sx={{ border: '1px solid grey' }} />
              <Tab label="Spatial Imaging" {...a11yProps(2)} sx={{ border: '1px solid grey' }} />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <Grid
              container
              direction="row"
              alignItems="center"
              justifyContent="space-evenly"
              spacing={2}
            >
              <Grid item>
                <Grid
                  container
                  direction="column"
                  alignItems="center"
                  justifyContent="space-evenly"
                >
                  {inputs.map((input: { label: string }, index: React.Key | null | undefined) => (
                    <Grid item key={index}>
                      <TextField id="standard-basic" variant="standard" label={input.label} />
                    </Grid>
                  ))}
                  <Grid mt={2} item>
                    <AddTargetButton />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <InfoPanel
                  title="FIELD TITLE HERE"
                  description="FIELD DESCRIPTION IN HERE"
                  additional="ADDITIONAL"
                />
              </Grid>
            </Grid>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <p>To be implemented at a later date</p>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={2}>
            <p>To be implemented at a later date</p>
          </CustomTabPanel>
        </Box>
      </Grid>
    </Grid>
  );
}
