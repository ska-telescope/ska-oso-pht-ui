import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import EmailIcon from '@mui/icons-material/Email';
import { TEXT_ENTRY_PARAMS } from '../../../utils/constants';
import { helpers } from '../../../utils/helpers';

export default function TeamInviteButton({ formValues }) {

  const [validFistNameState, setValidFistNameState] = React.useState(false);
  const [validLastNameState, setValidLastNameState] = React.useState(false);
  const [validEmailState, setValidEmailState] = React.useState(false);

  function validateForm() {
    // VALIDATE FORM
    setValidFistNameState(helpers.validate.validateTextEntry(formValues.firstName.value, formValues.firstName.setValue, formValues.firstName.setErrorText, 'EMPTY'));
    setValidLastNameState(helpers.validate.validateTextEntry(formValues.lastName.value, formValues.lastName.setValue, formValues.lastName.setErrorText, 'EMPTY'));
    setValidEmailState(helpers.validate.validateTextEntry(formValues.email.value, formValues.email.setValue, formValues.email.setErrorText, 'EMAIL_STRICT'));
  }

  function AddTeamMember() {
    // TO DO
    console.log("IN AddTeamMember");
  }

  const ClickFunction = () => {
    // validate form
    validateForm();

    // call AddTeamMember if all three form items are valid
    if (validFistNameState && validLastNameState && validEmailState) {
      AddTeamMember();
    }
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
    />
  );
}