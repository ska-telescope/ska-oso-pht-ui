/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { Box, Stack } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { TextEntry, TickBox, ButtonSizeTypes } from '@ska-telescope/ska-gui-components';
import PostSendEmailInvite from '@services/axios/post/postSendEmailInvite/postSendEmailInvite';
import PutProposal from '@services/axios/put/putProposal/putProposal';
import { Proposal, ProposalBackend } from '@utils/types/proposal.tsx';
import { generateId, helpers } from '@utils/helpers.ts';
import { LAB_POS_TICK, PROPOSAL_STATUS, TEAM_STATUS_TYPE_OPTIONS } from '@utils/constants.ts';
import TeamInviteButton from '../../../components/button/TeamInvite/TeamInvite';
import Investigator from '../../../utils/types/investigator';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import { useNotify } from '@/utils/notify/useNotify';
import PostProposalAccess from '@/services/axios/post/postProposalAccess/postProposalAccess';
import ProposalAccess from '@/utils/types/proposalAccess';
import { PROPOSAL_ACCESS_VIEW } from '@/utils/aaa/aaaUtils';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import UserSearchButton from '@/components/button/Search/Search';
import GetUserByEmail from '@/services/axios/get/getUserByEmail/getUserByEmail';
import ResetButton from '@/components/button/Reset/Reset';
import { useHelp } from '@/utils/help/useHelp';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';

const NOTIFICATION_DELAY_IN_SECONDS = 5;
export const LAB_WIDTH = 5;
const GAP = 5;

interface MemberEntryProps {
  invitationBtnClicked?: () => void;
}

export default function MemberEntry({ invitationBtnClicked = () => {} }: MemberEntryProps) {
  const { t } = useScopedTranslation();
  const { application, updateAppContent2 } = storageObject.useStore();
  const { setHelp } = useHelp();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);
  const authClient = useAxiosAuthClient();
  const { notifyError, notifyWarning, notifySuccess } = useNotify();
  const { isSV } = useOSDAccessors();

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [pi, setPi] = React.useState(false);
  const [phdThesis, setPhdThesis] = React.useState(false);

  const [errorTextFirstName, setErrorTextFirstName] = React.useState('');
  const [errorTextLastName, setErrorTextLastName] = React.useState('');
  const [errorTextEmail, setErrorTextEmail] = React.useState('');

  const [formInvalid, setFormInvalid] = React.useState(true);
  const [emailInvalid, setEmailInvalid] = React.useState(true);
  const [validateToggle, setValidateToggle] = React.useState(false);

  const [investigator, setInvestigator] = React.useState<Investigator | undefined>(undefined);

  const [forSearch, setForSearch] = React.useState(false);

  const LABEL_WIDTH = 4;

  React.useEffect(() => {
    const invalidEmail = Boolean(emailValidation());
    setEmailInvalid(invalidEmail);
  }, [validateToggle]);

  function emailValidation() {
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
    setHelp('email.help');
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [firstName, lastName, email]);

  React.useEffect(() => {
    const invalidForm = Boolean(formValidation());
    setFormInvalid(invalidForm);
  }, [validateToggle]);

  const handleCheckboxChangePhD = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhdThesis(event.target.checked);
  };

  const handleCheckboxChangePI = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPi(event.target.checked);
  };

  const updateProposalResponse = (response: ProposalBackend | { error: string }) => {
    if (response && !('error' in response)) {
      notifySuccess(t('saveBtn.success'));
    } else {
      notifyError(
        'error' in response ? response.error : 'An unknown error occurred',
        NOTIFICATION_DELAY_IN_SECONDS
      );
    }
  };

  const updateProposal = async (rec: Proposal) => {
    const response = await PutProposal(authClient, rec, isSV, PROPOSAL_STATUS.DRAFT);
    updateProposalResponse(response);
  };

  const createAccessRights = async (investigatorId: string): Promise<boolean> => {
    const access: ProposalAccess = {
      id: generateId('access-'),
      prslId: getProposal().id,
      userId: investigatorId,
      role: 'Co-Investigator',
      permissions: [PROPOSAL_ACCESS_VIEW]
    };
    const response = await PostProposalAccess(authClient, access);
    if (typeof response === 'object' && 'error' in response) {
      notifyError(response.error, NOTIFICATION_DELAY_IN_SECONDS);
      return false;
    } else {
      return true;
    }
  };

  async function addToProposalAndSave(
    currentInvestigators: Investigator[] | undefined,
    newInvestigator: Investigator
  ) {
    const record = {
      ...getProposal(),
      investigators: [...(currentInvestigators ?? []), newInvestigator]
    };
    setProposal(record);
    // save the proposal with new investigators as email has been sent & access rights have been created
    await updateProposal(record);
  }

  const getInvestigator = (currentInvestigators: Investigator[] | undefined): Investigator => {
    let highestId = currentInvestigators?.reduce((acc, investigator) => {
      const idNumber = Number(investigator.id.replace('temp-', ''));
      return idNumber > acc ? idNumber : acc;
    }, 0);
    if (highestId === undefined) {
      highestId = 0;
    }

    return {
      id: forSearch && investigator ? investigator?.id : `temp-${(highestId + 1).toString()}`,
      firstName: firstName,
      lastName: lastName,
      email: email,
      affiliation: '',
      phdThesis: phdThesis,
      status: TEAM_STATUS_TYPE_OPTIONS.pending,
      pi: pi,
      officeLocation: null,
      jobTitle: null
    };
  };

  async function AddInvestigator() {
    const currentInvestigators = getProposal().investigators;
    const newInvestigator: Investigator = getInvestigator(currentInvestigators);
    // ---------------------------------------------------------------------------------------------------
    // ---PATH 1---: found investigator with valid entra id (search path), should be added once rights are created
    // ---------------------------------------------------------------------------------------------------
    if (forSearch && (await createAccessRights(newInvestigator.id))) {
      addToProposalAndSave(currentInvestigators, newInvestigator);
    }
    // ---------------------------------------------------------------------------------------------------
    // ---PATH 2---: for investigator without valid entra id (sent email path), don't create access rights
    // ---------------------------------------------------------------------------------------------------
    if (!forSearch) {
      addToProposalAndSave(currentInvestigators, newInvestigator);
    }
  }

  async function sendEmailInvite(email: string, prsl_id: string): Promise<boolean> {
    notifyWarning(t('email.warning'));
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

  const resolveButton = () => {
    async function searchEmail(email: string): Promise<boolean> {
      const response = await GetUserByEmail(authClient, email);
      if (typeof response === 'string') {
        notifyError(t('emailSearch.error'), NOTIFICATION_DELAY_IN_SECONDS);
        return false;
      } else {
        notifySuccess(t('emailSearch.success'));
        setInvestigator(response);
        setFirstName(response?.firstName);
        setLastName(response?.lastName);
        return true;
      }
    }

    const userSearchClickFunction = async () => {
      if (await searchEmail(email)) {
        setForSearch(true);
      }
    };

    return (
      <Box p={0} mt={-1}>
        <UserSearchButton
          action={userSearchClickFunction}
          disabled={emailInvalid}
          primary
          testId="userSearchButton"
          size={ButtonSizeTypes.Small}
        />
      </Box>
    );
  };

  function clearForm() {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPi(false);
    setPhdThesis(false);
    setForSearch(false);
  }

  const clickFunction = async () => {
    if (await sendEmailInvite(email, getProposal().id)) {
      await AddInvestigator();
      clearForm();
      invitationBtnClicked();
    }
  };

  const firstNameField = () => (
    <TextEntry
      label={t('firstName.label')}
      testId="firstName"
      value={firstName}
      setValue={setFirstName}
      onFocus={() => setHelp('firstName.help')}
      errorText={errorTextFirstName}
      required
      disabled={forSearch}
    />
  );

  const lastNameField = () => (
    <TextEntry
      label={t('lastName.label')}
      testId="lastName"
      value={lastName}
      setValue={setLastName}
      onFocus={() => setHelp('lastName.help')}
      errorText={errorTextLastName}
      required
      disabled={forSearch}
    />
  );

  const emailField = () => (
    <TextEntry
      label={t('email.label')}
      testId="email"
      value={email}
      setValue={setEmail}
      errorText={errorTextEmail ? t(errorTextEmail) : ''}
      onFocus={() => setHelp('email.help')}
      required
      disabled={forSearch}
      suffix={resolveButton()}
    />
  );

  const piField = () => (
    <Box p={0} m={0}>
      <TickBox
        label={t('pi.label')}
        labelPosition={LAB_POS_TICK}
        labelWidth={LABEL_WIDTH}
        testId="piCheckbox"
        checked={pi}
        onChange={handleCheckboxChangePI}
        onFocus={() => setHelp('pi.help')}
      />
    </Box>
  );

  const phdThesisField = () => (
    <Box p={0} m={0}>
      <TickBox
        label={t('phdThesis.label')}
        labelPosition={LAB_POS_TICK}
        labelWidth={LABEL_WIDTH}
        testId="PhDCheckbox"
        checked={phdThesis}
        onChange={handleCheckboxChangePhD}
        onFocus={() => setHelp('phdThesis.help')}
      />
    </Box>
  );

  return (
    <Stack p={GAP} spacing={GAP}>
      {emailField()}
      {firstNameField()}
      {lastNameField()}
      {!isSV && piField()}
      {!isSV && phdThesisField()}
      <Stack spacing={GAP} direction="row">
        <TeamInviteButton
          action={clickFunction}
          disabled={formInvalid}
          primary
          testId="sendInviteButton"
        />
        {forSearch && <ResetButton action={clearForm} />}
      </Stack>
    </Stack>
  );
}
