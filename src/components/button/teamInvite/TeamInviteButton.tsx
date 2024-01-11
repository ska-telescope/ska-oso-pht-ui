import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import EmailIcon from '@mui/icons-material/Email';
import { TEAM_STATUS_TYPE_OPTIONS } from '../../../utils/constants';
import { getMockTeam, setMockTeam } from '../../../services/axios/getTeam/mockTeam';

interface TeamInviteButtonProps {
  formValues: any;
  disabled: boolean
}

export default function TeamInviteButton({
  formValues,
  disabled
}: TeamInviteButtonProps) {

  function AddTeamMember() {
    const currentTeam = getMockTeam();
    const highestId = getMockTeam().reduce(
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
    setMockTeam([...currentTeam, newTeamMember]);
  }

  function clearForm() {
    formValues.firstName.setValue("");
    formValues.lastName.setValue("");
    formValues.email.setValue("");
    formValues.phdThesis.setValue("");
  }

  const ClickFunction = () => {
      AddTeamMember();
      clearForm();
  };

  const title = 'Send Invitation';

  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Secondary}
      label={title}
      onClick={ClickFunction}
      icon={<EmailIcon />}
      testId={`${title}Button`}
      variant={ButtonVariantTypes.Contained}
      disabled={disabled}
    />
  );
}
