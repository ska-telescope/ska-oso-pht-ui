import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Card, CardContent, CardHeader, Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { FileUpload, FileUploadStatus } from '@ska-telescope/ska-gui-components';
import Shell from '../../components/layout/Shell/Shell';
import { Proposal } from '../../utils/types/proposal';
import PutUploadPDF from '../../services/axios/putUploadPDF/putUploadPDF';
import GetPresignedUploadUrl from '../../services/axios/getPresignedUploadUrl/getPresignedUploadUrl';
import GetPresignedDownloadUrl from '../../services/axios/getPresignedDownloadUrl/getPresignedDownloadUrl';

import { STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '../../utils/constants';
import DownloadButton from '../../components/button/Download/Download';

const PAGE = 6;

export default function TechnicalPage() {
  const { t } = useTranslation('pht');
  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [uploadButtonStatus, setUploadButtonStatus] = React.useState<FileUploadStatus>(null);

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const getProposalState = () => application.content1 as number[];
  const setTheProposalState = (value: number) => {
    const temp: number[] = [];
    for (let i = 0; i < getProposalState().length; i++) {
      temp.push(PAGE === i ? value : getProposalState()[i]);
    }
    updateAppContent1(temp);
  };

  const setFile = (theFile: File) => {
    //TODO: to decide when to set technicalPDF when adding the link in PUT endpoint
    setProposal({ ...getProposal(), technicalPDF: theFile });
  };

  const setUploadStatus = (status: FileUploadStatus) => {
    setProposal({ ...getProposal(), technicalLoadStatus: status });
    setUploadButtonStatus(status);
  };

  const uploadPDFTtoSignedUrl = async theFile => {
    setUploadStatus(FileUploadStatus.PENDING);

    try {
      const proposal = getProposal();
      const prsl_id = proposal.id;
      const signedUrl = await GetPresignedUploadUrl(`${prsl_id}-technical.pdf`);

      if (typeof signedUrl != 'string') new Error('Not able to Get Technical PDF Upload URL');

      const uploadResult = await PutUploadPDF(signedUrl, theFile);

      if (uploadResult.error) {
        throw new Error('Technical PDF Not Uploaded');
      }
      setUploadStatus(FileUploadStatus.OK);
    } catch (e) {
      setFile(null);
      setUploadStatus(FileUploadStatus.ERROR);
    }
  };

  const downloadPdfToSignedUrl = async () => {
    try {
      const proposal = getProposal();
      const prsl_id = proposal.id;
      const selectedFile = `${prsl_id}-` + t('pdfDownload.technical.label') + t('fileType.pdf');
      const signedUrl = await GetPresignedDownloadUrl(selectedFile);

      if (signedUrl === t('pdfDownload.sampleData') || proposal.technicalPDF != null) {
        window.open(signedUrl, '_blank');
      }
    } catch (e) {
      new Error(t('pdfDownload.error'));
    }
  };

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
    if (getProposal()?.technicalLoadStatus === null) {
      setUploadStatus(FileUploadStatus.INITIAL);
    }
  }, [getProposal()]);

  React.useEffect(() => {
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
    let count = getProposal()?.technicalPDF ? 1 : 0;
    count += getProposal()?.technicalLoadStatus === FileUploadStatus.OK ? 1 : 0;
    setTheProposalState(result[count]);
  }, [validateToggle]);

  return (
    <Shell page={PAGE}>
      <Grid
        spacing={1}
        p={3}
        container
        direction="row"
        alignItems="space-evenly"
        justifyContent="space-around"
      >
        <Grid item xs={2} />
        <Grid item xs={2}>
          <Typography variant="body2" data-testid="uploadPdfLabel">
            {t('uploadPDF.label')}
          </Typography>
          <FileUpload
            chooseFileTypes=".pdf"
            clearLabel={t('clearBtn.label')}
            clearToolTip={t('clearBtn.toolTip')}
            direction="column"
            file={getProposal()?.technicalPDF}
            maxFileWidth={25}
            setFile={setFile}
            setStatus={setUploadStatus}
            testId="fileUpload"
            uploadFunction={uploadPDFTtoSignedUrl}
            status={uploadButtonStatus}
          />
          {getProposal().technicalPDF != null && uploadButtonStatus === FileUploadStatus.OK && (
            <Box pt={1}>
              <DownloadButton
                toolTip={t('pdfDownload.technical.toolTip')}
                action={downloadPdfToSignedUrl}
              />
            </Box>
          )}
        </Grid>
        <Grid item xs={6}>
          <Card variant="outlined" sx={{ height: '60vh', width: '100%' }}>
            <CardHeader
              title={
                <Typography variant="h6" data-testid="pdfPreviewLabel">
                  {t('pdfPreview.label')}
                </Typography>
              }
            />
            <CardContent sx={{ height: '55vh' }}></CardContent>
          </Card>
        </Grid>
        <Grid item xs={2} />
      </Grid>
    </Shell>
  );
}
