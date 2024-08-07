import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { FileUpload, FileUploadStatus } from '@ska-telescope/ska-gui-components';

import Shell from '../../components/layout/Shell/Shell';
import { Proposal } from '../../utils/types/proposal';
import PutUploadPDF from '../../services/axios/putUploadPDF/putUploadPDF';
import GetPresignedUploadUrl from '../../services/axios/getPresignedUploadUrl/getPresignedUploadUrl';

import { validateTechnicalPage } from '../../utils/proposalValidation';
import GetPresignedDownloadUrl from '../../services/axios/getPresignedDownloadUrl/getPresignedDownloadUrl';
import DownloadButton from '../../components/button/Download/Download';
import PDFViewer from '../../components/layout/PDFViewer/PDFViewer';
import PDFPreviewButton from '../../components/button/PDFPreview/PDFPreview';

const PAGE = 6;

export default function TechnicalPage() {
  const { t } = useTranslation('pht');
  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [uploadButtonStatus, setUploadButtonStatus] = React.useState<FileUploadStatus>(null);
  const [currentFile, setCurrentFile] = React.useState(null);

  const [openPDFViewer, setOpenPDFViewer] = React.useState(false);
  const handleClosePDFViewer = () => setOpenPDFViewer(false);

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
    const file = {
      documentId: `technical-doc-${getProposal().id}`,
      link: (theFile as unknown) as string,
      file: theFile
    };
    setProposal({ ...getProposal(), technicalPDF: file });
    setCurrentFile(theFile);
  };

  const setUploadStatus = (status: FileUploadStatus) => {
    setProposal({ ...getProposal(), technicalLoadStatus: status });
    setUploadButtonStatus(status);
  };

  const uploadPdftoSignedUrl = async theFile => {
    setUploadStatus(FileUploadStatus.PENDING);

    try {
      const proposal = getProposal();
      const signedUrl = await GetPresignedUploadUrl(`${proposal.id}-technical.pdf`);

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

  const downloadPDFToSignedUrl = async () => {
    try {
      const proposal = getProposal();
      const selectedFile = `${proposal.id}-` + t('pdfDownload.technical.label') + t('fileType.pdf');
      const signedUrl = await GetPresignedDownloadUrl(selectedFile);

      if (signedUrl === t('pdfDownload.sampleData') || proposal.technicalPDF != null) {
        window.open(signedUrl, '_blank');
      }
    } catch (e) {
      new Error(t('pdfDownload.error'));
    }
  };

  const previewSignedUrl = async () => {
    try {
      const proposal = getProposal();
      const selectedFile = `${proposal.id}-` + t('pdfDownload.technical.label') + t('fileType.pdf');
      const signedUrl = await GetPresignedDownloadUrl(selectedFile);

      if (signedUrl === t('pdfDownload.sampleData') || proposal.sciencePDF != null) {
        setCurrentFile(signedUrl);
        setOpenPDFViewer(true);
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
    setTheProposalState(validateTechnicalPage(getProposal()));
  }, [validateToggle]);

  return (
    <Shell page={PAGE}>
      <Grid container direction="row" alignItems="space-evenly" justifyContent="space-around">
        <Grid item xs={6}>
          <FileUpload
            chooseFileTypes=".pdf"
            clearLabel={t('clearBtn.label')}
            clearToolTip={t('clearBtn.toolTip')}
            direction="row"
            file={getProposal()?.technicalPDF?.file}
            maxFileWidth={25}
            setFile={setFile}
            setStatus={setUploadStatus}
            testId="fileUpload"
            uploadFunction={uploadPdftoSignedUrl}
            status={uploadButtonStatus}
          />
        </Grid>
      </Grid>
      <Grid spacing={1} p={3} container direction="row" alignItems="center" justifyContent="center">
        <Grid item>
          {getProposal().technicalPDF != null && uploadButtonStatus === FileUploadStatus.OK && (
            <PDFPreviewButton toolTip={'pdfPreview.technical'} action={previewSignedUrl} />
          )}
        </Grid>
        <Grid item>
          {getProposal().technicalPDF != null && uploadButtonStatus === FileUploadStatus.OK && (
            <DownloadButton
              toolTip={'pdfDownload.technical.toolTip'}
              action={downloadPDFToSignedUrl}
            />
          )}
        </Grid>
      </Grid>
      <PDFViewer open={openPDFViewer} onClose={handleClosePDFViewer} url={currentFile} />
    </Shell>
  );
}
