import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import EmailIcon from '@mui/icons-material/Email';
import { TEAM_STATUS_TYPE_OPTIONS } from '../../../utils/constants';
import { helpers } from '../../../utils/helpers';
import { getMockTeam, setMockTeam } from '../../../services/axios/getTeam/mockTeam';

export default function TeamInviteButton({ formValues }) {
  const [validFistNameState, setValidFistNameState] = React.useState(false);
  const [validLastNameState, setValidLastNameState] = React.useState(false);
  const [validEmailState, setValidEmailState] = React.useState(false);

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
    // setMockTeam(newTeamMember);
    setMockTeam([...currentTeam, newTeamMember]);
  }

  function validateForm() {
    // VALIDATE FORM
    setValidFistNameState(
      helpers.validate.validateTextEntry(
        formValues.firstName.value,
        formValues.firstName.setValue,
        formValues.firstName.setErrorText,
        'EMPTY'
      )
    );
    setValidLastNameState(
      helpers.validate.validateTextEntry(
        formValues.lastName.value,
        formValues.lastName.setValue,
        formValues.lastName.setErrorText,
        'EMPTY'
      )
    );
    setValidEmailState(
      helpers.validate.validateTextEntry(
        formValues.email.value,
        formValues.email.setValue,
        formValues.email.setErrorText,
        'EMAIL_STRICT'
      )
    );

    if (validFistNameState && validLastNameState && validEmailState) {
      // console.log("YES VALID");
      AddTeamMember();
    }

  }


  const ClickFunction = () => {
    validateForm();
    // call AddTeamMember if all three form items are valid
    /*
    if (validFistNameState && validLastNameState && validEmailState) {
      AddTeamMember();
    }
    */
    
  };

  React.useEffect(() => {
    if (validFistNameState && validLastNameState && validEmailState) {
      // AddTeamMember();
    }
  }, [validFistNameState, validLastNameState, validEmailState]);

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
    />
  );
}
