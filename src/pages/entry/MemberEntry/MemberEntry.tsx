/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { TextEntry, TickBox } from '@ska-telescope/ska-gui-components';
import TeamInviteButton from '../../../components/button/TeamInvite/TeamInvite';
import { Proposal } from '../../../utils/types/proposal';
import { helpers } from '../../../utils/helpers';
import { LAB_POSITION, TEAM_STATUS_TYPE_OPTIONS, WRAPPER_HEIGHT } from '../../../utils/constants';
import HelpPanel from '../../../components/info/helpPanel/HelpPanel';
import Investigator from '../../../utils/types/investigator';
import PostSendEmailInvite from '../../../services/axios/postSendEmailInvite/postSendEmailInvite';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import { useNotify } from '@/utils/notify/useNotify';

const NOTIFICATION_DELAY_IN_SECONDS = 5;

interface MemberEntryProps {
  forSearch?: boolean;
  foundInvestigator?: Investigator;
}

export default function MemberEntry({
  forSearch = false,
  foundInvestigator = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    affiliation: '',
    phdThesis: false,
    status: '',
    pi: false,
    officeLocation: null,
    jobTitle: null
  }
}: MemberEntryProps) {
  const { t } = useTranslation('pht');
  const LABEL_WIDTH = 6;
  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);
  const authClient = useAxiosAuthClient();
  const { notifyError, notifySuccess } = useNotify();

  const [firstName, setFirstName] = React.useState(forSearch ? foundInvestigator.firstName : '');
  const [lastName, setLastName] = React.useState(forSearch ? foundInvestigator.lastName : '');
  const [email, setEmail] = React.useState(forSearch ? foundInvestigator.email : '');
  const [pi, setPi] = React.useState(false);
  const [phdThesis, setPhdThesis] = React.useState(false);

  const [errorTextFirstName, setErrorTextFirstName] = React.useState('');
  const [errorTextLastName, setErrorTextLastName] = React.useState('');
  const [errorTextEmail, setErrorTextEmail] = React.useState('');

  const [formInvalid, setFormInvalid] = React.useState(true);
  const [validateToggle, setValidateToggle] = React.useState(false);

  const fieldWrapper = (children?: React.JSX.Element) => (
    <Box
      p={0}
      pt={1}
      sx={{
        height: WRAPPER_HEIGHT
      }}
    >
      {children}
    </Box>
  );

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

  function AddInvestigator() {
    const currentInvestigators = getProposal().investigators;
    let highestId = currentInvestigators?.reduce(
      (acc, investigator) => (Number(investigator.id) > acc ? Number(investigator.id) : acc),
      0
    );
    if (highestId === undefined) {
      highestId = 0;
    }
    const newInvestigator: Investigator = {
      id: (highestId + 1).toString(),
      firstName: formValues.firstName.value,
      lastName: formValues.lastName.value,
      email: formValues.email.value,
      // country: '',
      affiliation: '',
      phdThesis: formValues.phdThesis.phdThesis,
      status: TEAM_STATUS_TYPE_OPTIONS.pending,
      pi: formValues.pi.pi,
      officeLocation: null,
      jobTitle: null
    };
    setProposal({ ...getProposal(), investigators: [...currentInvestigators, newInvestigator] });
  }

  async function sendEmailInvite(email: string, prsl_id: string): Promise<boolean> {
    const emailInvite = { email, prsl_id };
    const response = await PostSendEmailInvite(authClient, emailInvite);
    if (response && !response.error) {
      notifySuccess(t('email.success'), NOTIFICATION_DELAY_IN_SECONDS);
      return true;
    } else {
      notifyError(t('email.error'), NOTIFICATION_DELAY_IN_SECONDS);
      return false;
    }
  }

  function clearForm() {
    formValues.firstName.setValue('');
    formValues.lastName.setValue('');
    formValues.email.setValue('');
    formValues.pi.setValue(false);
    formValues.phdThesis.setValue(false);
  }

  const clickFunction = async () => {
    if (await sendEmailInvite(formValues.email.value, getProposal().id)) {
      AddInvestigator();
      clearForm();
    }
  };

  const firstNameField = () => {
    return fieldWrapper(
      <TextEntry
        label={t('firstName.label')}
        labelBold
        labelPosition={LAB_POSITION}
        testId="firstName"
        value={firstName}
        setValue={setFirstName}
        onFocus={() => helpComponent(t('firstName.help'))}
        errorText={errorTextFirstName}
        required
        disabled={forSearch}
      />
    );
  };

  const lastNameField = () => {
    return fieldWrapper(
      <TextEntry
        label={t('lastName.label')}
        labelBold
        labelPosition={LAB_POSITION}
        testId="lastName"
        value={lastName}
        setValue={setLastName}
        onFocus={() => helpComponent(t('lastName.help'))}
        errorText={errorTextLastName}
        required
        disabled={forSearch}
      />
    );
  };

  const emailField = () => {
    return fieldWrapper(
      <TextEntry
        label={t('email.label')}
        labelBold
        labelPosition={LAB_POSITION}
        testId="email"
        value={email}
        setValue={setEmail}
        errorText={errorTextEmail ? t(errorTextEmail) : ''}
        onFocus={() => helpComponent(t('email.help'))}
        required
        disabled={forSearch}
      />
    );
  };

  const piField = () => {
    return fieldWrapper(
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
    );
  };

  const phdThesisField = () => {
    return fieldWrapper(
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
    );
  };

  return (
    <Grid
      p={2}
      pb={5}
      container
      direction="row"
      alignItems="space-evenly"
      justifyContent="space-between"
    >
      <Grid item xs={7}>
        <Grid pt={1} container direction="column" alignItems="stretch" justifyContent="flex-start">
          {firstNameField()}
          {lastNameField()}
          {emailField()}
          {piField()}
          {phdThesisField()}
          <Box p={2}>
            <TeamInviteButton
              action={clickFunction}
              disabled={formInvalid}
              primary
              testId="sendInviteButton"
            />
          </Box>
        </Grid>
      </Grid>
      <Grid item xs={4}>
        <HelpPanel />
      </Grid>
    </Grid>
  );
}
