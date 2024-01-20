import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import SaveIcon from '@mui/icons-material/Save';
import { Proposal } from '../../../services/types/proposal';
import addProposalToDB from '../../../services/axios/addProposalToDB/addProposalToDB';
import mockProposal from '../../../services/axios/getProposal/getProposal';

// const [axiosError, setAxiosError] = React.useState('');

export default function SaveButton() {
  const ClickFunction = async () => {
    // TODO
    console.log("click save");
    const response = await addProposalToDB(mockProposal as unknown as Proposal);
    console.log('test response: ', response);
    if (response && !response.error) {
      // Handle successful response
      // setAxiosViewError(`Success: ${response}`);
      // setAxiosViewErrorColor(AlertColorTypes.Success);
      console.log('succes: ', response);
    } else {
      // Handle error response
      // setAxiosViewError(response.error);
      // setAxiosViewErrorColor(AlertColorTypes.Error);
      console.log('error: ', response.error);
    }
  };

  const title = 'Save';

  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Secondary}
      icon={<SaveIcon />}
      label={title}
      onClick={ClickFunction}
      testId={`${title}Button`}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
