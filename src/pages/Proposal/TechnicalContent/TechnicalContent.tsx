import React from 'react';
import { Grid, Typography } from '@mui/material';
import { FileUpload } from '@ska-telescope/ska-gui-components';
import { Proposal } from '../../../services/types/proposal';
import { STATUS_ERROR, STATUS_OK } from '../../../utils/constants';

interface TechnicalContentProps {
  page: number;
  proposal: Proposal;
  setProposal: Function;
  setStatus: Function;
}

export default function TechnicalContent({
  page,
  proposal,
  setProposal,
  setStatus
}: TechnicalContentProps) {
  const [validateToggle, setValidateToggle] = React.useState(false);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [proposal]);

  React.useEffect(() => {
    if (typeof setStatus !== 'function') {
      return;
    }
    const result = [STATUS_ERROR, STATUS_OK];
    const count = proposal?.technicalPDF ? 1 : 0;
    setStatus([page, result[count]]);
  }, [validateToggle]);

  const setFile = (theFile: string) => {
    setProposal({ ...proposal, technicalPDF: theFile });
  };

  return (
    <Grid container p={1} direction="column" alignItems="flex-start" justifyContent="flex-start">
      <Grid item>
        <Typography variant="body2">Upload PDF</Typography>
        <FileUpload
          chooseFileTypes=".pdf"
          file={proposal.technicalPDF}
          setFile={setFile}
          uploadURL="https://httpbin.org/post"
        />
      </Grid>
    </Grid>
  );
}
