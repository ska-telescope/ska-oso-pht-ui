import React from 'react';
import { Card, CardContent, CardHeader, Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { FileUpload, FileUploadStatus } from '@ska-telescope/ska-gui-components';
import PageBanner from '../../components/layout/pageBanner/PageBanner';
import PageFooter from '../../components/layout/pageFooter/PageFooter';
import { Proposal } from '../../services/types/proposal';
import UploadPDF from '../../services/axios/uploadPDF/uploadPDF';
import { STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '../../utils/constants';

const PAGE = 3;

export default function SciencePage() {
  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const getProposalState = () => application.content1 as number[];
  const setTheProposalState = (value: number) => {
    const temp = [];
    for (let i = 0; i < getProposalState().length; i++) {
      temp.push(PAGE === i ? value : getProposalState()[i]);
    }
    updateAppContent1(temp);
  };

  const setFile = (theFile: File) => {
    setProposal({ ...getProposal(), sciencePDF: theFile });
  };

  const setUploadStatus = (status: FileUploadStatus) => {
    setProposal({ ...getProposal(), scienceLoadStatus: status });
  };

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
    if (getProposal()?.scienceLoadStatus === null) {
      setUploadStatus(FileUploadStatus.INITIAL);
    }
  }, [getProposal()]);

  React.useEffect(() => {
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
    let count = getProposal()?.sciencePDF ? 1 : 0;
    count += getProposal()?.scienceLoadStatus === FileUploadStatus.OK ? 1 : 0;
    setTheProposalState(result[count]);
  }, [validateToggle]);

  return (
    <>
      <PageBanner pageNo={PAGE} />
      <Grid container p={1} direction="row" alignItems="flex-start" justifyContent="flex-start">
        <Grid item xs={2}>
          <Typography variant="body2" data-testid="uploadPdfLabel">
            Upload PDF
          </Typography>
          <FileUpload
            chooseFileTypes=".pdf"
            direction="column"
            file={getProposal()?.sciencePDF}
            maxFileWidth={25}
            setFile={setFile}
            setStatus={setUploadStatus}
            uploadURL={UploadPDF()}
          />
        </Grid>
        <Grid item xs={6}>
          <Card variant="outlined" sx={{ height: '60vh', width: '100%' }}>
            <CardHeader
              title={(
                <Typography variant="h6" data-testid="pdfPreviewLabel">
                  PDF Preview
                </Typography>
              )}
            />
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
      <PageFooter pageNo={PAGE} />
    </>
  );
}
