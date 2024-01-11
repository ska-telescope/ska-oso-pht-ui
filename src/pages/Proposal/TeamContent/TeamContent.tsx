/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { Box, Grid, Tab, Tabs, SvgIcon } from '@mui/material';
import { TextEntry, TickBox } from '@ska-telescope/ska-gui-components';
import { StarBorderRounded, StarRateRounded } from '@mui/icons-material';
import { helpers } from '../../../utils/helpers';
import DataGridWrapper from '../../../components/wrappers/dataGridWrapper/dataGridWrapper';
import InfoPanel from '../../../components/infoPanel/infoPanel';
import TeamInviteButton from '../../../components/button/teamInvite/TeamInviteButton';
import { DEFAULT_HELP, STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '../../../utils/constants';
import DeleteProposalButton from '../../../components/button/deleteProposal/deleteProposalButton';
import { getMockTeam } from '../../../services/axios/getTeam/mockTeam';

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

export const HELP_FIRSTNAME = {
  title: 'Help first name',
  description: 'Field sensitive help',
  additional: ''
};
export const HELP_LASTNAME = {
  title: 'Help last name',
  description: 'Field sensitive help',
  additional: ''
};
export const HELP_EMAIL = {
  title: 'Help email',
  description: 'Field sensitive help',
  additional: ''
};
export const HELP_PHD = {
  title: 'Help PhD',
  description: 'Field sensitive help',
  additional: ''
};

export default function TeamContent({ page, setStatus }: TeamContentProps) {
  const [value, setValue] = React.useState(0);
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phdThesis, setPhdThesis] = React.useState(false);
  const [help, setHelp] = React.useState(DEFAULT_HELP);
  const [errorTextFirstName, setErrorTextFirstName] = React.useState('');
  const [errorTextLastName, setErrorTextLastName] = React.useState('');
  const [errorTextEmail, setErrorTextEmail] = React.useState('');

  const [validFistNameState, setValidFistNameState] = React.useState(false);
  const [validLastNameState, setValidLastNameState] = React.useState(false);
  const [validEmailState, setValidEmailState] = React.useState(false);
  const [invalidFormState, setInvalidFormState] = React.useState(true);

  // to pass form state to TeamInviteButton
  const formValues = {
    firstName: {
      value: firstName,
      setValue: setFirstName
    },
    lastName: {
      value: lastName,
      setValue: setLastName
    },
    email: {
      value: email,
      setValue: setEmail
    },
    phdThesis: {
      phdThesis,
      setValue: setPhdThesis
    }
  };

  function formValidation() {
    let count = 0;

    // first name
    let emptyField = firstName === '';
    let isValid = !emptyField;
    setValidFistNameState(isValid);
    count += isValid ? 0 : 1;
    if (!emptyField) {
      isValid = helpers.validate.validateTextEntry(
        firstName,
        setFirstName,
        setErrorTextFirstName,
        'DEFAULT'
      );
      setValidFistNameState(isValid);
      count += isValid ? 0 : 1;
    } else {
      setErrorTextFirstName(''); // don't display error when empty
    }

    // last name
    emptyField = lastName === '';
    isValid = !emptyField;
    setValidLastNameState(isValid);
    count += isValid ? 0 : 1;
    if (!emptyField) {
      isValid = helpers.validate.validateTextEntry(
        lastName,
        setLastName,
        setErrorTextLastName,
        'DEFAULT'
      );
      setValidLastNameState(isValid);
      count += isValid ? 0 : 1;
    } else {
      setErrorTextLastName('');
    }

    // email
    emptyField = email === '';
    isValid = !emptyField;
    setValidEmailState(isValid);
    count += isValid ? 0 : 1;
    if (!emptyField) {
      isValid = helpers.validate.validateTextEntry(email, setEmail, setErrorTextEmail, 'EMAIL');
      setValidEmailState(isValid);
      count += isValid ? 0 : 1;
    } else {
      setErrorTextEmail('');
    }

    return count;
  }

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhdThesis(event.target.checked);
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

  React.useEffect(() => {
    const invalidForm = Boolean(formValidation());
    setInvalidFormState(invalidForm);
  });

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

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`
    };
  }

  const panel1 = () => (
    <Grid item>
      <Grid p={1} container direction="row" alignItems="space-evenly" justifyContent="space-around">
        <Grid item xs={5}>
          <Box component="form">
            <TextEntry
              label="First Name"
              testId="firstName"
              value={firstName}
              setValue={setFirstName}
              onFocus={() => setHelp(HELP_FIRSTNAME)}
              disabled={false}
              errorText={errorTextFirstName}
            />
            <TextEntry
              label="Last Name"
              testId="lastName"
              value={lastName}
              setValue={setLastName}
              onFocus={() => setHelp(HELP_LASTNAME)}
              errorText={errorTextLastName}
            />
            <TextEntry
              label="Email"
              testId="email"
              value={email}
              setValue={setEmail}
              errorText={errorTextEmail}
              onFocus={() => setHelp(HELP_EMAIL)}
            />
            <TickBox
              label="PhD Thesis"
              testId="PhDCheckbox"
              checked={phdThesis}
              onChange={handleCheckboxChange}
              onFocus={() => setHelp(HELP_PHD)}
            />
          </Box>
        </Grid>
        <Grid item xs={5}>
          <InfoPanel
            title={help.title}
            description={help.description}
            additional={help.additional}
            testId="infoPanelId"
          />
        </Grid>
      </Grid>

      <Grid item xs={3} ml={3}>
        <TeamInviteButton disabled={invalidFormState} formValues={formValues} />
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
        <Grid sx={{ border: '1px solid grey', minWidth: 545 }} item md={6} xs={11}>
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
