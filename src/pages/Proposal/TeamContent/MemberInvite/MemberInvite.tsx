/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { Box, Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { TextEntry, TickBox } from '@ska-telescope/ska-gui-components';
import TeamInviteButton from '../../../../components/button/teamInvite/TeamInviteButton';
import { Proposal } from '../../../../services/types/proposal';
import { helpers } from '../../../../utils/helpers';
import { DEFAULT_HELP, TEAM_STATUS_TYPE_OPTIONS } from '../../../../utils/constants';
import HelpPanel from '../../../../components/helpPanel/helpPanel';

export const HELP_FIRST_NAME = ['Help first name', 'Field sensitive help', ''];
export const HELP_LAST_NAME = ['Help last name', 'Field sensitive help', ''];
export const HELP_EMAIL = ['Help email', 'Field sensitive help', ''];
export const HELP_PHD = ['Help PhD', 'Field sensitive help', ''];
export const HELP_PI = ['Help PI', 'PI HELP', ''];

interface MemberInviteProps {
  proposal: Proposal;
  setProposal: Function;
}

export default function MemberInvite({ proposal, setProposal }: MemberInviteProps) {
  const { helpContent } = storageObject.useStore();
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [pi, setPi] = React.useState(false);
  const [phdThesis, setPhdThesis] = React.useState(false);

  const [errorTextFirstName, setErrorTextFirstName] = React.useState('');
  const [errorTextLastName, setErrorTextLastName] = React.useState('');
  const [errorTextEmail, setErrorTextEmail] = React.useState('');

  const [formInvalid, setFormInvalid] = React.useState(true);
  const [validateToggle, setValidateToggle] = React.useState(false);

  function formValidation() {
    let count = 0;

    // first name
    let emptyField = firstName === '';
    let isValid = !emptyField;
    count += isValid ? 0 : 1;
    if (!emptyField) {
      isValid = helpers.validate.validateTextEntry(
        firstName,
        setFirstName,
        setErrorTextFirstName,
        'DEFAULT'
      );
      count += isValid ? 0 : 1;
    } else {
      setErrorTextFirstName(''); // don't display error when empty
    }

    // last name
    emptyField = lastName === '';
    isValid = !emptyField;
    count += isValid ? 0 : 1;
    if (!emptyField) {
      isValid = helpers.validate.validateTextEntry(
        lastName,
        setLastName,
        setErrorTextLastName,
        'DEFAULT'
      );
      count += isValid ? 0 : 1;
    } else {
      setErrorTextLastName('');
    }

    // email
    emptyField = email === '';
    isValid = !emptyField;
    count += isValid ? 0 : 1;
    if (!emptyField) {
      isValid = helpers.validate.validateTextEntry(email, setEmail, setErrorTextEmail, 'EMAIL');
      count += isValid ? 0 : 1;
    } else {
      setErrorTextEmail('');
    }
    return count;
  }

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
    helpContent(DEFAULT_HELP);
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [firstName, lastName, email]);

  React.useEffect(() => {
    const invalidForm = Boolean(formValidation());
    setFormInvalid(invalidForm);
  }, [validateToggle]);

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
    },
    pi: {
      pi,
      setValue: setPi
    }
  };

  const handleCheckboxChangePhD = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhdThesis(event.target.checked);
  };

  const handleCheckboxChangePI = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPi(event.target.checked);
  };

  function AddTeamMember() {
    const currentTeam = proposal.team;
    const highestId = currentTeam.reduce(
      (acc, teamMember) => (teamMember.id > acc ? teamMember.id : acc),
      0
    );
    const newTeamMember = {
      id: highestId + 1,
      firstName: formValues.firstName.value,
      lastName: formValues.lastName.value,
      email: formValues.email.value,
      country: '',
      affiliation: '',
      phdThesis: formValues.phdThesis.phdThesis,
      status: TEAM_STATUS_TYPE_OPTIONS.pending,
      actions: null,
      pi: formValues.pi.pi
    };
    setProposal({ ...proposal, team: [...currentTeam, newTeamMember] });
  }

  function clearForm() {
    formValues.firstName.setValue('');
    formValues.lastName.setValue('');
    formValues.email.setValue('');
    formValues.pi.setValue(false);
    formValues.phdThesis.setValue(false);
  }

  const clickFunction = () => {
    AddTeamMember();
    clearForm();
  };

  return (
    <>
      <Grid p={1} container direction="row" alignItems="space-evenly" justifyContent="space-around">
        <Grid item xs={5}>
          <TextEntry
            label="First Name"
            testId="firstName"
            value={firstName}
            setValue={setFirstName}
            onFocus={() => helpContent(HELP_FIRST_NAME)}
            disabled={false}
            errorText={errorTextFirstName}
          />
          <TextEntry
            label="Last Name"
            testId="lastName"
            value={lastName}
            setValue={setLastName}
            onFocus={() => helpContent(HELP_LAST_NAME)}
            errorText={errorTextLastName}
          />
          <TextEntry
            label="Email"
            testId="email"
            value={email}
            setValue={setEmail}
            errorText={errorTextEmail}
            onFocus={() => helpContent(HELP_EMAIL)}
          />
          <TickBox
            label="Primary Investigator"
            testId="piCheckbox"
            checked={pi}
            onChange={handleCheckboxChangePI}
            onFocus={() => helpContent(HELP_PI)}
          />
          <TickBox
            label="PhD Thesis"
            testId="PhDCheckbox"
            checked={phdThesis}
            onChange={handleCheckboxChangePhD}
            onFocus={() => helpContent(HELP_PHD)}
          />
        </Grid>
        <Grid item xs={5}>
          <HelpPanel />
        </Grid>
      </Grid>

      <Box p={1}>
        <TeamInviteButton disabled={formInvalid} onClick={clickFunction} />
      </Box>
    </>
  );
}
