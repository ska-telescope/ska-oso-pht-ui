import React from 'react';
import { Card, CardContent, CardHeader, Grid, Typography } from '@mui/material';
import { FileUpload, FileUploadStatus } from '@ska-telescope/ska-gui-components';
import { Proposal } from '../../../services/types/proposal';
import { STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '../../../utils/constants';

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

  const setFile = (theFile: string) => {
    setProposal({ ...proposal, technicalPDF: theFile });
  };

  const setUploadStatus = (status: FileUploadStatus) => {
    setProposal({ ...proposal, technicalLoadStatus: status });
  };

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
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
    let count = proposal?.technicalPDF ? 1 : 0;
    count += proposal?.technicalLoadStatus === FileUploadStatus.OK ? 1 : 0;
    setStatus([page, result[count]]);
  }, [validateToggle]);

  return (
    <Grid
      container
      p={1}
      spacing={1}
      direction="row"
      alignItems="flex-start"
      justifyContent="flex-start"
    >
      <Grid item xs={2}>
        <Typography variant="body2" data-testid="uploadPdfLabel">Upload PDF</Typography>
        <FileUpload
          chooseFileTypes=".pdf"
          direction="column"
          file={proposal.technicalPDF}
          setFile={setFile}
          setStatus={setUploadStatus}
          uploadURL="https://httpbin.org/post"
        />
      </Grid>
      <Grid item xs={6}>
        <Card variant="outlined" sx={{ height: '60vh', width: '100%' }}>
          <CardHeader title={<Typography variant="h6" data-testid="pdfPreviewLabel">PDF Preview</Typography>} />
          <CardContent sx={{ height: '55vh' }}>
            <object
              data="https://dagrs.berkeley.edu/sites/default/files/2020-01/sample.pdf"
              type="application/pdf"
              width="100%"
              height="100%"
            >
              <p>Syntax error or PDF not available </p>
            </object>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
