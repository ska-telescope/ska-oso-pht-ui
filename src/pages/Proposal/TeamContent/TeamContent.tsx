/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { Box, Checkbox, FormControlLabel, Grid, Tab, Tabs, Typography, SvgIcon } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import { StarBorderRounded, StarRateRounded } from '@mui/icons-material';
import DataGridWrapper from '../../../components/wrappers/dataGridWrapper/dataGridWrapper';
import InfoPanel from '../../../components/infoPanel/infoPanel';
import TeamInviteButton from '../../../components/button/teamInvite/TeamInviteButton';
import { DEFAULT_HELP, TEAM } from '../../../utils/constants';
import DeleteProposalButton from '../../../components/button/deleteProposal/deleteProposalButton';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  tabValue: number;
}

export function PIStar(props) {
  const {isPI} = props;
  if (isPI) {
    return (
      <SvgIcon component={StarRateRounded} viewBox="0 0 24 24" {...props} />
    );
  }
  return (
    <SvgIcon component={StarBorderRounded} viewBox="0 0 24 24" {...props} />
  );
}

export default function TeamContent() {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [help] = React.useState(DEFAULT_HELP);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const columns = [
    { field: 'LastName', headerName: 'Last Name', width: 200 },
    { field: 'FirstName', headerName: 'First Name', width: 200 },
    { field: 'Status', headerName: 'Misc', width: 200 },
    { field: 'PHDThesis', headerName: 'PHD Thesis', width: 200 },
    {
      field: "PI",
      headerName: "PI",
      sortable: false,
      width: 100,
      disableClickEventBubbling: true,
      renderCell: (params) => (
        <PIStar isPI={Boolean(params.row.PI)} />
      )
    },
    {
      field: "Actions",
      headerName: "Actions",
      sortable: false,
      width: 100,
      disableClickEventBubbling: true,
      renderCell: () => (
        <DeleteProposalButton />
        )
    }
  ];
  const extendedColumns = [...columns];

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
                      control={(
                        <Checkbox
                          defaultChecked
                          sx={{
                            '&.Mui-checked': {
                              color: theme.palette.secondary.main
                            }
                          }}
                        />
                      )}
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
