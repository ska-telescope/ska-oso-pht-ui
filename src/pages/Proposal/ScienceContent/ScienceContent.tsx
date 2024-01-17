import React from 'react';
import { Grid, Typography } from '@mui/material';
import { FileUpload } from '@ska-telescope/ska-gui-components';
import { Proposal } from '../../../services/types/proposal';
import { STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '../../../utils/constants';

interface ScienceContentProps {
  page: number;
  proposal: Proposal;
  setProposal: Function;
  setStatus: Function;
}

export default function ScienceContent({
  page,
  proposal,
  setProposal,
  setStatus
}: ScienceContentProps) {
  const [uploadStatus, setUploadStatus] = React.useState(9);
  const [validateToggle, setValidateToggle] = React.useState(false);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [proposal, uploadStatus]);

  React.useEffect(() => {
    if (typeof setStatus !== 'function') {
      return;
    }
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
    let count = proposal?.sciencePDF ? 1 : 0;
    count += uploadStatus === 0 ? 1 : 0;
    setStatus([page, result[count]]);
  }, [validateToggle]);

  const setFile = (theFile: string) => {
    setProposal({ ...proposal, sciencePDF: theFile });
  };

  return (
    <Grid container p={1} direction="column" alignItems="flex-start" justifyContent="flex-start">
      <Grid item>
        <Typography variant="body2">Upload PDF</Typography>
        <FileUpload
          chooseFileTypes=".pdf"
          file={proposal?.sciencePDF}
          setFile={setFile}
          setStatus={setUploadStatus}
          uploadURL="https://httpbin.org/post"
        />
      </Grid>
    </Grid>
  );
}
