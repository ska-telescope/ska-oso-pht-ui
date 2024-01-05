/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { Box, Checkbox, FormControlLabel, Grid, Tab, Tabs, Typography } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import DataGridWrapper from '../../../components/wrappers/dataGridWrapper/dataGridWrapper';
import InfoPanel from '../../../components/infoPanel/infoPanel';
import TeamInviteButton from '../../../components/button/teamInvite/TeamInviteButton';
import {
  DEFAULT_HELP,
  STATUS_ERROR,
  STATUS_OK,
  STATUS_PARTIAL,
  TEAM
} from '../../../utils/constants';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  tabValue: number;
}

interface TeamContentProps {
  page: number;
  setStatus: Function;
}

export default function TeamContent({ page, setStatus }: TeamContentProps) {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [help] = React.useState(DEFAULT_HELP);

  React.useEffect(() => {
    if (typeof setStatus !== 'function') {
      return;
    }
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
    const count = 0;

    // TODO : Increment the count for every passing element of the page.
    // This is then used to take the status from the result array
    // In the default provided, the count must be 2 for the page to pass.

    // See titleContent page for working example

    setStatus([page, result[count]]);
  }, [setStatus]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const columns = [
    { field: 'LastName', headerName: 'Last Name', width: 200 },
    { field: 'FirstName', headerName: 'First Name', width: 200 },
    { field: 'misc', headerName: 'Misc', width: 200 }
  ];

  const extendedColumns = structuredClone(columns);

  const ClickFunction = () => {
    // TODO
  };

  function CustomTabPanel(props: TabPanelProps) {
    const { children, tabValue, index } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
      >
        {tabValue === index && (
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

  return (
    <Grid container direction="column" alignItems="space-evenly" justifyContent="space-around">
      <Grid p={1} container direction="row" alignItems="space-evenly" justifyContent="space-around">
        <Grid item>
          <DataGridWrapper
            rows={TEAM}
            extendedColumns={extendedColumns}
            height={400}
            rowClick={ClickFunction}
          />
        </Grid>
        <Grid sx={{ border: '1px solid grey' }} item>
          <Box sx={{ width: '100%' }}>
            <Box>
              <Tabs
                textColor="secondary"
                indicatorColor="secondary"
                value={value}
                onChange={handleChange}
                aria-label="basic tabs example"
              >
                <Tab
                  label="Invite Team Member"
                  {...a11yProps(0)}
                  sx={{ border: '1px solid grey' }}
                />
                <Tab label="Import From File" {...a11yProps(1)} sx={{ border: '1px solid grey' }} />
                <Tab
                  label="Search For Member"
                  {...a11yProps(2)}
                  sx={{ border: '1px solid grey' }}
                />
              </Tabs>
            </Box>
            <CustomTabPanel tabValue={value} index={0}>
              <Grid item>
                <Grid
                  p={1}
                  container
                  direction="row"
                  alignItems="space-evenly"
                  justifyContent="space-around"
                >
                  <Grid item xs={6}>
                    <TextEntry
                      label="First Name"
                      testId="firstName"
                      value={firstName}
                      setValue={setFirstName}
                    />
                    <TextEntry
                      label="Last Name"
                      testId="lastName"
                      value={lastName}
                      setValue={setLastName}
                    />
                    <TextEntry label="Email" testId="email" value={email} setValue={setEmail} />
                    <FormControlLabel
                      value="phdThesis"
                      control={
                        <Checkbox
                          defaultChecked
                          sx={{
                            '&.Mui-checked': {
                              color: theme.palette.secondary.main
                            }
                          }}
                        />
                      }
                      label="PhD Thesis"
                      labelPlacement="end"
                      sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <InfoPanel
                      title={help.title}
                      description={help.description}
                      additional={help.additional}
                    />
                  </Grid>
                </Grid>

                <Grid item xs={3}>
                  <TeamInviteButton />
                </Grid>
              </Grid>
            </CustomTabPanel>
            <CustomTabPanel tabValue={value} index={1}>
              <p>To be implemented at a later date</p>
            </CustomTabPanel>
            <CustomTabPanel tabValue={value} index={2}>
              <p>To be implemented at a later date</p>
            </CustomTabPanel>
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
}
