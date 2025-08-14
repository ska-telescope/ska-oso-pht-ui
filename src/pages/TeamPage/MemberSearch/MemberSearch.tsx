/* eslint-disable react/no-unstable-nested-components */
import { Box, Grid } from '@mui/material';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import MemberEntry from '@/pages/entry/MemberEntry/MemberEntry';
import { GetMockUserByEmail } from '@/services/axios/getUserByEmail/getUserByEmail';
import HelpPanel from '@/components/info/helpPanel/HelpPanel';
import { LAB_POSITION, WRAPPER_HEIGHT } from '@/utils/constants';
import UserSearchButton from '@/components/button/UserSearch/UserSearch';
import { helpers } from '@/utils/helpers';

export default function MemberSearch() {
  const { t } = useTranslation('pht');
  const [email, setEmail] = React.useState('');
  const [formInvalid, setFormInvalid] = React.useState(true);
  const [validateToggle, setValidateToggle] = React.useState(false);
  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();
  const [errorTextEmail, setErrorTextEmail] = React.useState('');

  const fetchData = async () => {
    await GetMockUserByEmail();
  };

  fetchData();

  React.useEffect(() => {
      setValidateToggle(!validateToggle);
      helpComponent(t('email.help')); // TODO update email help text for search user context
    }, []);
  
    React.useEffect(() => {
      setValidateToggle(!validateToggle);
    }, [email]);

  React.useEffect(() => {
      const invalidForm = Boolean(formValidation());
      setFormInvalid(invalidForm);
    }, [validateToggle]);

  const formValues = {
    email: {
      value: email,
      setValue: setEmail
    }
  };

  const memberEntry = () => <MemberEntry />;

  function clearForm() {
    formValues.email.setValue('');
  }

  function formValidation() {
    let count = 0;
    let emptyField = email === '';
    let isValid = !emptyField;
    count += isValid ? 0 : 1;
    if (!emptyField) {
      isValid = helpers.validate.validateTextEntry(email, setEmail, setErrorTextEmail, 'EMAIL');
      count += isValid ? 0 : 1;
    } else {
      setErrorTextEmail('');
    }
    return count;
  }

  const fieldWrapper = (children?: React.JSX.Element) => (
    <Box
      p={0}
      pt={1}
      mb={5}
      sx={{
        height: WRAPPER_HEIGHT
      }}
    >
      {children}
    </Box>
  );

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
      />
    );
  };

  const clickFunction = async () => {
    if (await GetMockUserByEmail) {
      /*
      if user found: 
        - show member entry with user details
        - clearForm();

        if not: 
        - show error message
      */
    }
  };

  const memberSearch = () => {
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
          <Grid
            pt={1}
            container
            direction="column"
            alignItems="stretch"
            justifyContent="flex-start"
          >
            {emailField()}
            <Box p={2}>
              {
                <UserSearchButton
                  action={clickFunction}
                  disabled={formInvalid}
                  primary
                  testId="sendInviteButton"
                />
              }
            </Box>
          </Grid>
        </Grid>
        <Grid item xs={4}>
          <HelpPanel />
        </Grid>
      </Grid>
    );
  };

  return memberSearch();

  // return memberEntry();
}
