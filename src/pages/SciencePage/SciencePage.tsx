import React from 'react';
import { isLoggedIn } from '@ska-telescope/ska-login-page';

import { Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { FileUpload, FileUploadStatus } from '@ska-telescope/ska-gui-components';

import DeletePDF from '@services/axios/delete/deletePDF/deletePDF.tsx';
import GetPresignedDeleteUrl from '@services/axios/get/getPresignedDeleteUrl/getPresignedDeleteUrl';
import GetPresignedDownloadUrl from '@services/axios/get/getPresignedDownloadUrl/getPresignedDownloadUrl';
import GetPresignedUploadUrl from '@services/axios/get/getPresignedUploadUrl/getPresignedUploadUrl';
import PutUploadPDF from '@services/axios/put/putUploadPDF/putUploadPDF';

import DeleteButton from '../../components/button/Delete/Delete';
import DownloadButton from '../../components/button/Download/Download';
import PDFPreviewButton from '../../components/button/PDFPreview/PDFPreview';
import PDFWrapper from '../../components/layout/PDFWrapper/PDFWrapper';
import Shell from '../../components/layout/Shell/Shell';
import HelpPanel from '../../components/info/helpPanel/HelpPanel';

import { Proposal } from '../../utils/types/proposal';
import { validateSciencePage } from '../../utils/validation/validation';
import { PAGE_DESCRIPTION, UPLOAD_MAX_WIDTH_PDF } from '../../utils/constants';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import { useNotify } from '@/utils/notify/useNotify';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

const PAGE = PAGE_DESCRIPTION;

export default function SciencePage() {
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
  const authClient = useAxiosAuthClient();

  const isDisableEndpoints = () => !loggedIn;

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

  const setFile = (theFile: string | null) => {
    if (theFile) {
      setCurrentFile(theFile);
    } else {
      setProposal({
        ...getProposal(),
        sciencePDF: null
      });
      setCurrentFile(null);
    }
  };

  const setUploadStatus = (status: typeof FileUploadStatus) => {
    setProposal({ ...getProposal(), scienceLoadStatus: status });
  };

  const uploadPdftoSignedUrl = async (theFile: any) => {
    setUploadStatus(FileUploadStatus.PENDING);

    try {
      notifyWarning(t('pdfUpload.science.warning'));
      const proposal = getProposal();
      const signedUrl = await GetPresignedUploadUrl(authClient, `${proposal.id}-science.pdf`);

      if (typeof signedUrl != 'string') new Error('Not able to Get Science PDF Upload URL');

      const uploadResult = await PutUploadPDF(signedUrl, theFile);

      if (uploadResult.error) {
        setUploadStatus(FileUploadStatus.ERROR);
        notifyError(t('pdfUpload.science.error'));
        throw new Error('Science PDF Not Uploaded');
      }
      const sciencePDFUploaded = {
        documentId: `science-doc-${proposal.id}`,
        isUploadedPdf: true
      };

      setProposal({
        ...getProposal(),
        sciencePDF: sciencePDFUploaded,
        scienceLoadStatus: FileUploadStatus.OK
      });

      notifySuccess(t('pdfUpload.science.success'));
    } catch (e) {
      setFile(null);
      setUploadStatus(FileUploadStatus.ERROR);
    }
  };

  const downloadPDFToSignedUrl = async () => {
    try {
      const proposal = getProposal();
      const selectedFile = `${proposal.id}-` + t('pdfDownload.science.label') + t('fileType.pdf');
      const signedUrl = await GetPresignedDownloadUrl(authClient, selectedFile);

      if (signedUrl === t('pdfDownload.sampleData') || proposal.sciencePDF != null) {
        window.open(signedUrl, '_blank');
      }
    } catch (e) {
      new Error(t('pdfDownload.error'));
    }
  };

  const deletePdfUsingSignedUrl = async () => {
    try {
      const proposal = getProposal();
      const signedUrl = await GetPresignedDeleteUrl(authClient, `${proposal.id}-science.pdf`);

      if (typeof signedUrl != 'string') new Error('Not able to Get Science PDF Upload URL');

      const deleteResult = await DeletePDF(signedUrl);

      if (deleteResult.error || deleteResult === 'error.API_UNKNOWN_ERROR') {
        throw new Error('Not able to Delete Science PDF');
      }

      const sciencePDFDeleted = {
        documentId: `science-doc-${proposal.id}`,
        isUploadedPdf: false
      };

      setProposal({
        ...getProposal(),
        sciencePDF: sciencePDFDeleted,
        scienceLoadStatus: FileUploadStatus.INITIAL
      });
      notifySuccess(t('pdfDelete.science.success'));
    } catch (e) {
      new Error(t('pdfDelete.science.error'));
      notifyError(t('pdfDelete.science.error'));
    }
  };

  const previewSignedUrl = async () => {
    try {
      const proposal = getProposal();
      const selectedFile = `${proposal.id}-` + t('pdfDownload.science.label') + t('fileType.pdf');
      const signedUrl = await GetPresignedDownloadUrl(authClient, selectedFile);

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
    if (getProposal()?.sciencePDF?.documentId) {
      setCurrentFile(getProposal()?.sciencePDF?.documentId);
      setOriginalFile(getProposal()?.sciencePDF?.documentId + t('fileType.pdf'));
    }
    helpComponent(t('page.' + PAGE + '.help'));
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
    if (getProposal()?.scienceLoadStatus === null) {
      setUploadStatus(FileUploadStatus.INITIAL);
    }
  }, [getProposal()]);

  React.useEffect(() => {
    setTheProposalState(validateSciencePage(getProposal()));
  }, [validateToggle]);

  const PDFView = () => (
    <PDFWrapper open={openPDFViewer} onClose={handleClosePDFViewer} url={currentFile ?? ''} />
  );

  const uploadSuffix = () => (
    <Grid pt={1} spacing={1} container direction="row" alignItems="center" justifyContent="center">
      <Grid>
        {getProposal()?.sciencePDF?.isUploadedPdf && (
          <PDFPreviewButton
            title="pdfUpload.science.label.preview"
            toolTip="pdfUpload.science.tooltip.preview"
            action={previewSignedUrl}
          />
        )}
      </Grid>
      <Grid>
        {getProposal()?.sciencePDF?.isUploadedPdf && (
          <DownloadButton
            title="pdfUpload.science.label.download"
            toolTip="pdfUpload.science.tooltip.download"
            action={downloadPDFToSignedUrl}
          />
        )}
      </Grid>
      <Grid>
        {getProposal()?.sciencePDF?.isUploadedPdf && (
          <DeleteButton
            title={'pdfUpload.science.label.delete'}
            toolTip="pdfUpload.science.tooltip.delete"
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
              chooseToolTip={t('pdfUpload.science.tooltip.choose')}
              clearLabel={t('clearBtn.label')}
              clearToolTip={t('pdfUpload.science.tooltip.clear')}
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
              uploadToolTip={t('pdfUpload.science.tooltip.upload')}
              status={getProposal().scienceLoadStatus}
              suffix={uploadSuffix()}
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
