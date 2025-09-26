import React from 'react';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import { Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { FileUpload, FileUploadStatus } from '@ska-telescope/ska-gui-components';

import DeletePDF from '@services/axios/delete/deletePDF/deletePDF.tsx';
import PutUploadPDF from '@services/axios/put/putUploadPDF/putUploadPDF';
import GetPresignedDeleteUrl from '@services/axios/get/getPresignedDeleteUrl/getPresignedDeleteUrl';
import GetPresignedDownloadUrl from '@services/axios/get/getPresignedDownloadUrl/getPresignedDownloadUrl';
import GetPresignedUploadUrl from '@services/axios/get/getPresignedUploadUrl/getPresignedUploadUrl';
import { Proposal } from '../../utils/types/proposal';
import HelpPanel from '../../components/info/helpPanel/HelpPanel';
import Shell from '../../components/layout/Shell/Shell';

import { validateTechnicalPage } from '../../utils/validation/validation';
import DownloadButton from '../../components/button/Download/Download';
import PDFWrapper from '../../components/layout/PDFWrapper/PDFWrapper';
import PDFPreviewButton from '../../components/button/PDFPreview/PDFPreview';
import DeleteButton from '../../components/button/Delete/Delete';

import { UPLOAD_MAX_WIDTH_PDF } from '../../utils/constants';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import { useNotify } from '@/utils/notify/useNotify';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

const NOTIFICATION_DELAY_IN_SECONDS = 5;
const PAGE = 6;

export default function TechnicalPage() {
  const { t } = useScopedTranslation();
  const { notifyError, notifyWarning, notifySuccess } = useNotify();
  const {
    application,
    helpComponent,
    updateAppContent1,
    updateAppContent2
  } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [currentFile, setCurrentFile] = React.useState<string | null | undefined>(null);
  const [originalFile, setOriginalFile] = React.useState<string | null>(null);

  const [openPDFViewer, setOpenPDFViewer] = React.useState(false);
  const loggedIn = isLoggedIn();

  const isDisableEndpoints = () => !loggedIn;

  const handleClosePDFViewer = () => setOpenPDFViewer(false);

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);
  const authClient = useAxiosAuthClient();

  const getProposalState = () => application.content1 as number[];
  const setTheProposalState = (value: number) => {
    const temp: number[] = [];
    for (let i = 0; i < getProposalState().length; i++) {
      temp.push(PAGE === i ? value : getProposalState()[i]);
    }
    updateAppContent1(temp);
  };

  const setUploadStatus = (status: typeof FileUploadStatus) => {
    setProposal({ ...getProposal(), technicalLoadStatus: status });
  };

  const setFile = (theFile: string | null) => {
    if (theFile) {
      setCurrentFile(theFile);
    } else {
      setProposal({
        ...getProposal(),
        technicalPDF: null
      });
      setCurrentFile(null);
    }
  };

  const uploadPdftoSignedUrl = async (theFile: File) => {
    setUploadStatus(FileUploadStatus.PENDING);

    try {
      notifyWarning(t('pdfUpload.technical.warning'));
      const proposal = getProposal();
      const signedUrl = await GetPresignedUploadUrl(authClient, `${proposal.id}-technical.pdf`);
      if (typeof signedUrl != 'string') {
        setUploadStatus(FileUploadStatus.ERROR);
        new Error('Not able to Get Technical PDF Upload URL');
      }
      const uploadResult = await PutUploadPDF(signedUrl, theFile);
      if (uploadResult.error) {
        setUploadStatus(FileUploadStatus.ERROR);
        notifyError(t('pdfUpload.technical.error'));
        throw new Error('Technical PDF Not Uploaded');
      }

      const technicalPDFUploaded = {
        documentId: `technical-doc-${proposal.id}`,
        isUploadedPdf: true
      };

      setProposal({
        ...getProposal(),
        technicalPDF: technicalPDFUploaded,
        technicalLoadStatus: FileUploadStatus.OK
      });
      notifySuccess(t('pdfUpload.technical.success'), NOTIFICATION_DELAY_IN_SECONDS);
    } catch (e) {
      setFile(null);
      setUploadStatus(FileUploadStatus.ERROR);
    }
  };

  const downloadPDFToSignedUrl = async () => {
    try {
      const proposal = getProposal();
      const selectedFile = `${proposal.id}-` + t('pdfDownload.technical.label') + t('fileType.pdf');
      const signedUrl = await GetPresignedDownloadUrl(authClient, selectedFile);

      if (signedUrl === t('pdfDownload.sampleData') || proposal.technicalPDF != null) {
        window.open(signedUrl, '_blank');
      }
    } catch (e) {
      new Error(t('pdfDownload.error'));
    }
  };

  const deletePdfUsingSignedUrl = async () => {
    try {
      const proposal = getProposal();
      const signedUrl = await GetPresignedDeleteUrl(authClient, `${proposal.id}-technical.pdf`);

      if (typeof signedUrl != 'string') new Error('Not able to Get Technical PDF Upload URL');

      const deleteResult = await DeletePDF(signedUrl);

      if (deleteResult.error || deleteResult === 'error.API_UNKNOWN_ERROR') {
        throw new Error('Not able to delete Technical PDF');
      }

      const technicalPDFDeleted = {
        documentId: `technical-doc-${proposal.id}`,
        isUploadedPdf: false
      };

      setProposal({
        ...getProposal(),
        technicalPDF: technicalPDFDeleted,
        technicalLoadStatus: FileUploadStatus.INITIAL
      });

      notifySuccess(t('pdfDelete.technical.success'), NOTIFICATION_DELAY_IN_SECONDS);
    } catch (e) {
      new Error(t('pdfDelete.technical.error'));
      notifyError(t('pdfDelete.technical.error'), NOTIFICATION_DELAY_IN_SECONDS);
    }
  };

  const previewSignedUrl = async () => {
    try {
      const proposal = getProposal();
      const selectedFile = `${proposal.id}-` + t('pdfDownload.technical.label') + t('fileType.pdf');
      const signedUrl = await GetPresignedDownloadUrl(authClient, selectedFile);

      if (signedUrl === t('pdfDownload.sampleData') || proposal.technicalPDF != null) {
        setCurrentFile(signedUrl);
        setOpenPDFViewer(true);
      }
    } catch (e) {
      new Error(t('pdfDownload.error'));
    }
  };

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
    if (getProposal()?.technicalPDF?.documentId) {
      setCurrentFile(getProposal()?.technicalPDF?.documentId);
      setOriginalFile(getProposal()?.technicalPDF?.documentId + t('fileType.pdf'));
    }
    helpComponent(t('page.' + PAGE + '.help'));
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

  const PDFView = () => (
    <PDFWrapper open={openPDFViewer} onClose={handleClosePDFViewer} url={currentFile ?? ''} />
  );

  const uploadSuffix = () => (
    <Grid pt={1} spacing={1} container direction="row" alignItems="center" justifyContent="center">
      <Grid>
        {getProposal().technicalPDF?.isUploadedPdf && (
          <PDFPreviewButton
            title="pdfUpload.technical.label.preview"
            toolTip="pdfUpload.technical.tooltip.preview"
            action={previewSignedUrl}
          />
        )}
      </Grid>
      <Grid>
        {getProposal().technicalPDF?.isUploadedPdf && (
          <DownloadButton
            title="pdfUpload.technical.label.download"
            toolTip="pdfUpload.technical.tooltip.download"
            action={downloadPDFToSignedUrl}
          />
        )}
      </Grid>
      <Grid>
        {getProposal().technicalPDF?.isUploadedPdf && (
          <DeleteButton
            title={'pdfUpload.technical.label.delete'}
            toolTip="pdfUpload.technical.tooltip.delete"
            action={deletePdfUsingSignedUrl}
          />
        )}
      </Grid>
    </Grid>
  );

  return (
    <Shell page={PAGE}>
      <Grid container direction="row" alignItems="space-evenly" justifyContent="space-around">
        <Grid size={{ xs: 6 }}>
          {isDisableEndpoints() ? (
            <>{t('pdfUpload.disabled')}</>
          ) : (
            <FileUpload
              chooseToolTip={t('pdfUpload.technical.tooltip.choose')}
              clearLabel={t('clearBtn.label')}
              clearToolTip={t('pdfUpload.technical.tooltip.clear')}
              dropzone
              dropzoneAccepted={{
                'application/pdf': ['.pdf']
              }}
              dropzoneIcons={false}
              dropzonePrompt={t('dropzone.prompt')}
              dropzonePreview={false}
              direction="row"
              file={originalFile}
              maxFileWidth={UPLOAD_MAX_WIDTH_PDF}
              setFile={setFile}
              setStatus={setUploadStatus}
              testId="fileUpload"
              uploadFunction={uploadPdftoSignedUrl}
              uploadToolTip={t('pdfUpload.technical.tooltip.upload')}
              status={getProposal().technicalLoadStatus}
              suffix={getProposal()?.technicalPDF?.documentId ? uploadSuffix() : <></>}
            />
          )}
        </Grid>
        <Grid pt={4} size={{ xs: 4 }}>
          <HelpPanel />
        </Grid>
      </Grid>
      {PDFView()}
    </Shell>
  );
}
