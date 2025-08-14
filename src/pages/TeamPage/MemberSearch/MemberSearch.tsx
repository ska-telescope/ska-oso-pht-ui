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

export default function MemberSearch() {
  const { t } = useTranslation('pht');
  const [email, setEmail] = React.useState('');
  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();
  const [errorTextEmail, setErrorTextEmail] = React.useState('');

  const fetchData = async () => {
    await GetMockUserByEmail();
  };

  fetchData();

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

  const memberEntry = () => <MemberEntry />;

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
              {/* {
            <TeamInviteButton
              action={clickFunction}
              disabled={formInvalid}
              primary
              testId="sendInviteButton"
            />
            } */}
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
