/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  Tab,
  Tabs,
  SvgIcon
} from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import { StarBorderRounded, StarRateRounded } from '@mui/icons-material';
import { helpers } from '../../../utils/helpers';
import DataGridWrapper from '../../../components/wrappers/dataGridWrapper/dataGridWrapper';
import InfoPanel from '../../../components/infoPanel/infoPanel';
import TeamInviteButton from '../../../components/button/teamInvite/TeamInviteButton';
import { DEFAULT_HELP, STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '../../../utils/constants';
import DeleteProposalButton from '../../../components/button/deleteProposal/deleteProposalButton';
import { getMockTeam } from '../../../services/axios/getTeam/mockTeam';

/*
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  tabValue: number;
}
*/

export function PIStar({ isPI, status, ...rest }) {
  if (isPI) {
    return <SvgIcon component={StarRateRounded} viewBox="0 0 24 24" {...rest} />;
  }
  if (status === 'Accepted') {
    return <SvgIcon component={StarBorderRounded} viewBox="0 0 24 24" {...rest} />;
  }
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
  const [phdThesis, setPhdThesid] = React.useState(true);
  const [help] = React.useState(DEFAULT_HELP);
  const [errorTextFirstName, setErrorTextFirstName] = React.useState('');
  const [errorTextLastName, setErrorTextLastName] = React.useState('');
  const [errorTextEmail, setErrorTextEmail] = React.useState('');

  // to pass form state to TeamInviteButton
  const formValues = {
    firstName: {
      value: firstName,
      setValue: setErrorTextFirstName,
      errorText: errorTextFirstName,
      setErrorText: setErrorTextFirstName
    },
    lastName: {
      value: lastName,
      setValue: setErrorTextLastName,
      errorText: errorTextLastName,
      setErrorText: setErrorTextLastName
    },
    email: {
      value: email,
      setValue: setEmail,
      errorText: errorTextEmail,
      setErrorText: setErrorTextEmail
    },
    phdThesis: {
      phdThesis
    }
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhdThesid(event.target.checked);
  };

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
    { field: 'LastName', headerName: 'Last Name', flex: 1 },
    { field: 'FirstName', headerName: 'First Name', flex: 1 },
    { field: 'Status', headerName: 'Status', flex: 1 },
    { field: 'PHDThesis', headerName: 'PhD Thesis', flex: 1 },
    {
      field: 'PI',
      headerName: 'PI',
      sortable: false,
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: params => (
        <PIStar isPI={Boolean(params.row.PI)} status={String(params.row.Status)} />
      )
    },
    {
      field: 'Actions',
      headerName: 'Actions',
      sortable: false,
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: () => <DeleteProposalButton />
    }
  ];
  const extendedColumns = [...columns];

  const ClickFunction = () => {
    // TODO
  };

  /*
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
  */

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`
    };
  }

  const panel1 = () => (
    <Grid item>
      <Grid p={1} container direction="row" alignItems="space-evenly" justifyContent="space-around">
        <Grid item xs={6}>
          <Box component="form">
            <TextEntry
              label="First Name"
              testId="firstName"
              value={firstName}
              setValue={(firstNameVal: string) =>
                helpers.validate.validateTextEntry(
                  firstNameVal,
                  setFirstName,
                  setErrorTextFirstName
                )}
              disabled={false}
              errorText={errorTextFirstName}
            />
            <TextEntry
              label="Last Name"
              testId="lastName"
              value={lastName}
              setValue={(lastNameVal: string) =>
                helpers.validate.validateTextEntry(lastNameVal, setLastName, setErrorTextLastName)}
              errorText={errorTextLastName}
            />
            <TextEntry
              label="Email"
              testId="email"
              value={email}
              setValue={(emailVal: string) =>
                helpers.validate.validateTextEntry(emailVal, setEmail, setErrorTextEmail, 'EMAIL')}
              errorText={errorTextEmail}
            />
            <FormControlLabel
              value="phdThesis"
              control={(
                <Checkbox
                  sx={{
                    '&.Mui-checked': {
                      color: theme.palette.secondary.main
                    }
                  }}
                />
              )}
              label="PhD Thesis"
              labelPlacement="end"
              checked={phdThesis}
              onChange={handleCheckboxChange}
              sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
            />
          </Box>
        </Grid>
        <Grid item xs={4}>
          <InfoPanel
            title={help.title}
            description={help.description}
            additional={help.additional}
          />
        </Grid>
      </Grid>

      <Grid item xs={3} ml={3}>
        <TeamInviteButton formValues={formValues} />
      </Grid>
    </Grid>
  );

  const panel2 = () => (
    <Grid item>
      <p>To be implemented at a later date</p>
    </Grid>
  );

  const panel3 = () => (
    <Grid item>
      <p>To be implemented at a later date</p>
    </Grid>
  );

  return (
    <Grid container direction="column" alignItems="space-evenly" justifyContent="space-around">
      <Grid p={1} container direction="row" alignItems="space-evenly" justifyContent="space-around">
        <Grid item md={6} xs={11}>
          <DataGridWrapper
            rows={getMockTeam()}
            extendedColumns={extendedColumns}
            height={400}
            rowClick={ClickFunction}
            testId="teamTableId"
          />
        </Grid>
        <Grid sx={{ border: '1px solid grey', minWidth: 545}} item md={5} xs={11}>
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
                <Tab
                  label="Import From File"
                  {...a11yProps(1)}
                  sx={{ border: '1px solid grey' }}
                  disabled
                />
                <Tab
                  label="Search For Member"
                  {...a11yProps(2)}
                  sx={{ border: '1px solid grey' }}
                  disabled
                />
              </Tabs>
            </Box>
            {value === 0 && panel1()}
            {value === 1 && panel2()}
            {value === 2 && panel3()}
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
}
