/* eslint-disable react/no-unstable-nested-components */
import { Box, Grid2 } from '@mui/material';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import MemberEntry from '@/pages/entry/MemberEntry/MemberEntry';
import { GetMockUserByEmail } from '@/services/axios/getUserByEmail/getUserByEmail';
import HelpPanel from '@/components/info/helpPanel/HelpPanel';
import { LAB_POSITION, WRAPPER_HEIGHT } from '@/utils/constants';
import UserSearchButton from '@/components/button/Search/Search';
import { helpers } from '@/utils/helpers';
import { useNotify } from '@/utils/notify/useNotify';
import ResetSearchButton from '@/components/button/ResetSearch/ResetSearch';
import Investigator from '@/utils/types/investigator';

export default function MemberSearch() {
  const { t } = useTranslation('pht');
  const [email, setEmail] = React.useState('');
  const [formInvalid, setFormInvalid] = React.useState(true);
  const [validateToggle, setValidateToggle] = React.useState(false);
  const { helpComponent } = storageObject.useStore();
  const [errorTextEmail, setErrorTextEmail] = React.useState('');
  const { notifyError, notifySuccess } = useNotify();
  const [showMemberEntry, setShowMemberEntry] = React.useState(false);
  const [investigator, setInvestigator] = React.useState<Investigator | undefined>(undefined);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
    helpComponent(t('emailSearch.help'));
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

  function invitationBtnClicked(): void {
    setShowMemberEntry(false);
  }

  const memberEntry = () => (
    <MemberEntry
      forSearch
      foundInvestigator={investigator}
      invitationBtnClicked={invitationBtnClicked}
    />
  );

  const resetSearchClickFunction = () => {
    setShowMemberEntry(false);
  };

  const resetSearchButton = () => (
    <Box mt={-17} p={5} ml={25}>
      <ResetSearchButton action={resetSearchClickFunction} />
    </Box>
  );

  const searchUserButton = () => (
    <Box p={2}>
      {
        <UserSearchButton
          action={userSearchClickFunction}
          disabled={formInvalid}
          primary
          testId="userSearchButton"
        />
      }
    </Box>
  );

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
        label={t('emailSearch.label')}
        labelBold
        labelPosition={LAB_POSITION}
        testId="email"
        value={email}
        setValue={setEmail}
        errorText={errorTextEmail ? t(errorTextEmail) : ''}
        onFocus={() => helpComponent(t('emailSearch.help'))}
        required
      />
    );
  };

  async function searchEmail(email: string): Promise<boolean> {
    const response = GetMockUserByEmail(email);
    if (typeof response === 'string') {
      notifyError(t('emailSearch.error'));
      return false;
    } else {
      notifySuccess(t('emailSearch.success'));
      setInvestigator(response);
      return true;
    }
  }

  const userSearchClickFunction = async () => {
    if (await searchEmail(formValues.email.value)) {
      setShowMemberEntry(true);
      clearForm();
    }
  };

  const memberSearch = () => (
    <>
      <Grid2
        p={2}
        pb={5}
        container
        direction="row"
        alignItems="space-evenly"
        justifyContent="space-between"
      >
        <Grid2 size={{ xs: 7 }}>
          <Grid2
            pt={1}
            container
            direction="column"
            alignItems="stretch"
            justifyContent="flex-start"
          >
            {emailField()}
            {searchUserButton()}
          </Grid2>
        </Grid2>
        <Grid2 size={{ xs: 4 }}>
          <HelpPanel />
        </Grid2>
      </Grid2>
    </>
  );

  return (
    <>
      <Grid2>
        {!showMemberEntry && memberSearch()}
        {showMemberEntry && memberEntry()}
        {showMemberEntry && resetSearchButton()}
      </Grid2>
    </>
  );
}
