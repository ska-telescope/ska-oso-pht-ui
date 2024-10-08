/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes, TextEntry, TickBox } from '@ska-telescope/ska-gui-components';
import TeamInviteButton from '../../../components/button/TeamInvite/TeamInvite';
import { Proposal } from '../../../utils/types/proposal';
import { helpers } from '../../../utils/helpers';
import { LAB_POSITION, TEAM_STATUS_TYPE_OPTIONS } from '../../../utils/constants';
import HelpPanel from '../../../components/info/helpPanel/helpPanel';
import TeamMember from '../../../utils/types/teamMember';
import PostSendEmailInvite from '../../../services/axios/postSendEmailInvite/postSendEmailInvite';
import Notification from '../../../utils/types/notification';

export default function MemberInvite() {
  const { t } = useTranslation('pht');
  const LABEL_WIDTH = 6;
  const {
    application,
    helpComponent,
    updateAppContent2,
    updateAppContent5
  } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

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

  const NOTIFICATION_DELAY_IN_SECONDS = 5;

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
    helpComponent(t('firstName.help'));
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
    const currentTeam = getProposal().team;
    const highestId = currentTeam.reduce(
      (acc, teamMember) => (Number(teamMember.id) > acc ? Number(teamMember.id) : acc),
      0
    );
    const newTeamMember: TeamMember = {
      id: (highestId + 1).toString(),
      firstName: formValues.firstName.value,
      lastName: formValues.lastName.value,
      email: formValues.email.value,
      country: '',
      affiliation: '',
      phdThesis: formValues.phdThesis.phdThesis,
      status: TEAM_STATUS_TYPE_OPTIONS.pending,
      pi: formValues.pi.pi
    };
    setProposal({ ...getProposal(), team: [...currentTeam, newTeamMember] });
  }

  function Notify(str: string, lvl: AlertColorTypes = AlertColorTypes.Info) {
    const rec: Notification = {
      level: lvl,
      delay: NOTIFICATION_DELAY_IN_SECONDS,
      message: t(str),
      okRequired: false
    };
    updateAppContent5(rec);
  }

  const NotifyError = (str: string) => Notify(str, AlertColorTypes.Error);
  const NotifyOK = (str: string) => Notify(str, AlertColorTypes.Success);

  async function sendEmailInvite(email: string, prsl_id: string) {
    const emailInvite = { email, prsl_id };
    const response = await PostSendEmailInvite(emailInvite);
    if (response && !response.error) {
      NotifyOK(t('email.success'));
    } else {
      NotifyError(t('email.error'));
    }
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
    sendEmailInvite(formValues.email.value, getProposal().id);
    clearForm();
  };

  const firstNameField = () => {
    return (
      <Box p={1}>
        <TextEntry
          label={t('firstName.label')}
          labelBold
          labelPosition={LAB_POSITION}
          labelWidth={LABEL_WIDTH}
          testId="firstName"
          value={firstName}
          setValue={setFirstName}
          onFocus={() => helpComponent(t('firstName.help'))}
          errorText={errorTextFirstName}
          required
        />
      </Box>
    );
  };

  const lastNameField = () => {
    return (
      <Box p={1}>
        <TextEntry
          label={t('lastName.label')}
          labelBold
          labelPosition={LAB_POSITION}
          labelWidth={LABEL_WIDTH}
          testId="lastName"
          value={lastName}
          setValue={setLastName}
          onFocus={() => helpComponent(t('lastName.help'))}
          errorText={errorTextLastName}
          required
        />
      </Box>
    );
  };

  const emailField = () => {
    return (
      <Box p={1}>
        <TextEntry
          label={t('email.label')}
          labelBold
          labelPosition={LAB_POSITION}
          labelWidth={LABEL_WIDTH}
          testId="email"
          value={email}
          setValue={setEmail}
          errorText={errorTextEmail ? t(errorTextEmail) : ''}
          onFocus={() => helpComponent(t('email.help'))}
          required
        />
      </Box>
    );
  };

  const piField = () => {
    return (
      <Box pl={1}>
        <TickBox
          label={t('pi.label')}
          labelBold
          labelPosition={LAB_POSITION}
          labelWidth={LABEL_WIDTH}
          testId="piCheckbox"
          checked={pi}
          onChange={handleCheckboxChangePI}
          onFocus={() => helpComponent(t('pi.help'))}
        />
      </Box>
    );
  };

  const phdThesisField = () => {
    return (
      <Box pl={1}>
        <TickBox
          label={t('phdThesis.label')}
          labelBold
          labelPosition={LAB_POSITION}
          labelWidth={LABEL_WIDTH}
          testId="PhDCheckbox"
          checked={phdThesis}
          onChange={handleCheckboxChangePhD}
          onFocus={() => helpComponent(t('phdThesis.help'))}
        />
      </Box>
    );
  };

  return (
    <>
      <Grid
        p={1}
        container
        direction="row"
        alignItems="space-evenly"
        justifyContent="space-between"
      >
        <Grid item xs={6}>
          {firstNameField()}
          {lastNameField()}
          {emailField()}
          {piField()}
          {phdThesisField()}
        </Grid>
        <Grid item xs={5}>
          <HelpPanel />
        </Grid>
      </Grid>

      <Box p={1}>
        <TeamInviteButton
          action={clickFunction}
          disabled={formInvalid}
          primary
          testId="sendInviteButton"
        />
      </Box>
    </>
  );
}
