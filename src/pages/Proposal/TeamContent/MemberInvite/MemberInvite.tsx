/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { Box, Grid } from '@mui/material';
import { TextEntry, TickBox } from '@ska-telescope/ska-gui-components';
import InfoPanel from '../../../../components/infoPanel/infoPanel';
import TeamInviteButton from '../../../../components/button/teamInvite/TeamInviteButton';
import { Help } from '../../../../services/types/help';
import { Proposal } from '../../../../services/types/proposal';
import { helpers } from '../../../../utils/helpers';
import { TEAM_STATUS_TYPE_OPTIONS } from '../../../../utils/constants';
// TODO import { TeamMember } from '../../../../services/types/teamMember';

export const HELP_FIRST_NAME = {
  title: 'Help first name',
  description: 'Field sensitive help',
  additional: ''
};
export const HELP_LAST_NAME = {
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
export const HELP_PI = {
  title: 'Help PI',
  description: 'PI HELP',
  additional: ''
};

interface MemberInviteProps {
  help: Help;
  proposal: Proposal;
  setHelp: Function;
  setProposal: Function;
}

export default function MemberInvite({ help, proposal, setHelp, setProposal }: MemberInviteProps) {
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phdThesis, setPhdThesis] = React.useState(false);

  const [errorTextFirstName, setErrorTextFirstName] = React.useState('');
  const [errorTextLastName, setErrorTextLastName] = React.useState('');
  const [errorTextEmail, setErrorTextEmail] = React.useState('');

  const [formInvalid, setFormInvalid] = React.useState(true);

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
    const invalidForm = Boolean(formValidation());
    setFormInvalid(invalidForm);
  });

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

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhdThesis(event.target.checked);
  };

  function AddTeamMember() {
    const currentTeam = proposal.team;
    const highestId = currentTeam.reduce(
      (acc, teamMember) => (teamMember.id > acc ? teamMember.id : acc),
      0
    );
    const newTeamMember = {
      id: highestId + 1,
      FirstName: formValues.firstName.value,
      LastName: formValues.lastName.value,
      Email: formValues.email.value,
      Country: '',
      Affiliation: '',
      PHDThesis: formValues.phdThesis.phdThesis,
      Status: TEAM_STATUS_TYPE_OPTIONS.pending,
      Actions: null,
      PI: false
    };
    setProposal({ ...proposal, team: [...currentTeam, newTeamMember] });
  }

  function clearForm() {
    formValues.firstName.setValue('');
    formValues.lastName.setValue('');
    formValues.email.setValue('');
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
            onFocus={() => setHelp(HELP_FIRST_NAME)}
            disabled={false}
            errorText={errorTextFirstName}
          />
          <TextEntry
            label="Last Name"
            testId="lastName"
            value={lastName}
            setValue={setLastName}
            onFocus={() => setHelp(HELP_LAST_NAME)}
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

      <Box p={1}>
        <TeamInviteButton disabled={formInvalid} onClick={clickFunction} />
      </Box>
    </>
  );
}
