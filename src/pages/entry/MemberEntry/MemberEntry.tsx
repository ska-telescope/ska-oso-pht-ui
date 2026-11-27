import React from 'react';
import { Box, Stack } from '@mui/material';
import { TextEntry, TickBox, ButtonSizeTypes } from '@ska-telescope/ska-gui-components';
import { useProposalOda } from '@/models/proposals/useProposalOda';
import type { Proposal as ProposalPDM } from '@/generated/models/proposal';
import type { ApiResult } from '@/services/api/apiResult';
import { generateId, helpers } from '@utils/helpers.ts';
import {
  LAB_POS_TICK,
  NOTIFICATION_DELAY_IN_SECONDS,
  PROPOSAL_STATUS,
  TEAM_STATUS_TYPE_OPTIONS
} from '@utils/constants.ts';
import TeamInviteButton from '../../../components/button/TeamInvite/TeamInvite';
import Investigator from '../../../utils/types/investigator';
import { useNotify } from '@/utils/notify/useNotify';
import { createAccess } from '@/services/api/proposalAccess';
import ProposalAccess from '@/utils/types/proposalAccess';
import { PROPOSAL_ACCESS_VIEW } from '@/utils/aaa/aaaUtils';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import UserSearchButton from '@/components/button/Search/Search';
import { findUserByEmail, sendInvite } from '@/services/api/users';
import ResetButton from '@/components/button/Reset/Reset';
import { useHelp } from '@/utils/help/useHelp';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { useFormContext } from 'react-hook-form';
import { ProposalType } from '@/models/proposals/proposal';
import { getTeamValues } from '@/models/proposals/team';

const GAP = 5;

interface MemberEntryProps {
  invitationBtnClicked?: () => void;
}

export default function MemberEntry({ invitationBtnClicked = () => {} }: MemberEntryProps) {
  const { t } = useScopedTranslation();
  const form = useFormContext<ProposalType>();
  const { setHelp } = useHelp();

  const { saveToOda } = useProposalOda();
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

  const LABEL_WIDTH = 3;

  React.useEffect(() => {
    const invalidEmail = Boolean(emailValidation());
    setEmailInvalid(invalidEmail);
  }, [validateToggle]);

  function emailValidation() {
    let count = 0;
    const emptyField = email === '';
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

  const updateProposalResponse = (response: ApiResult<ProposalPDM>) => {
    if (!response.error) {
      notifySuccess(t('saveBtn.success'));
    } else {
      notifyError(response.error, NOTIFICATION_DELAY_IN_SECONDS);
    }
  };

  const updateProposal = async () => {
    const response = await saveToOda(PROPOSAL_STATUS.DRAFT);
    updateProposalResponse(response);
  };

  const createAccessRights = async (investigatorId: string): Promise<boolean> => {
    const access: ProposalAccess = {
      id: generateId('access-'),
      prslId: form.getValues('prslId'),
      userId: investigatorId,
      role: 'Co-Investigator',
      permissions: [PROPOSAL_ACCESS_VIEW]
    };
    const { error } = await createAccess(access);
    if (error) {
      notifyError(error, NOTIFICATION_DELAY_IN_SECONDS);
      return false;
    } else {
      return true;
    }
  };

  async function addToProposalAndSave(
    currentInvestigators: Investigator[] | undefined,
    newInvestigator: Investigator
  ) {
    const investigators = [...(currentInvestigators ?? []), newInvestigator];
    form.setValue('investigators', getTeamValues({ investigators }).investigators, {
      shouldValidate: true
    });
    // save the proposal with new investigators as email has been sent & access rights have been created
    await updateProposal();
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
      phdThesis: phdThesis,
      status: TEAM_STATUS_TYPE_OPTIONS.pending,
      pi: pi
    };
  };

  async function AddInvestigator() {
    const currentInvestigators = form.getValues('investigators');
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
    const { data } = await sendInvite(email, prsl_id);
    if (data) {
      notifySuccess(t('email.success'), NOTIFICATION_DELAY_IN_SECONDS);
      return true;
    } else {
      notifyError(t('email.error'), NOTIFICATION_DELAY_IN_SECONDS);
      return false;
    }
  }

  const resolveButton = () => {
    async function searchEmail(email: string): Promise<boolean> {
      const { data: user } = await findUserByEmail(email);
      if (!user) {
        notifyError(t('emailSearch.error'), NOTIFICATION_DELAY_IN_SECONDS);
        return false;
      } else {
        notifySuccess(t('emailSearch.success'));
        setInvestigator(user);
        setFirstName(user.firstName ?? '');
        setLastName(user.lastName ?? '');
        return true;
      }
    }

    const userSearchClickFunction = async () => {
      if (await searchEmail(email)) {
        setForSearch(true);
      }
    };

    return (
      <Box
        sx={{
          p: 0,
          mt: -1
        }}
      >
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

  const isRequired = () => email !== '' || firstName !== '' || lastName !== '';

  const clickFunction = async () => {
    if (await sendEmailInvite(email, form.getValues('prslId'))) {
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
      required={isRequired()}
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
      required={isRequired()}
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
      required={isRequired()}
      disabled={forSearch}
      suffix={resolveButton()}
    />
  );

  const piField = () => (
    <Box
      sx={{
        p: 0,
        m: 0
      }}
    >
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
    <Box
      sx={{
        p: 0,
        m: 0
      }}
    >
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
    <Stack
      spacing={GAP}
      sx={{
        p: GAP
      }}
    >
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
