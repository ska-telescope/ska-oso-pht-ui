import React from 'react';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import { useTranslation } from 'react-i18next';
import { Grid2 } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes, FileUpload, FileUploadStatus } from '@ska-telescope/ska-gui-components';

import DeleteDeletePDF from '../../services/axios/deleteDeletePDF/deleteDeletePDF';
import GetPresignedDeleteUrl from '../../services/axios/getPresignedDeleteUrl/getPresignedDeleteUrl';
import GetPresignedDownloadUrl from '../../services/axios/getPresignedDownloadUrl/getPresignedDownloadUrl';
import GetPresignedUploadUrl from '../../services/axios/getPresignedUploadUrl/getPresignedUploadUrl';
import PutUploadPDF from '../../services/axios/putUploadPDF/putUploadPDF';

import DeleteButton from '../../components/button/Delete/Delete';
import DownloadButton from '../../components/button/Download/Download';
import PDFPreviewButton from '../../components/button/PDFPreview/PDFPreview';
import PDFWrapper from '../../components/layout/PDFWrapper/PDFWrapper';
import Shell from '../../components/layout/Shell/Shell';
import HelpPanel from '../../components/info/helpPanel/HelpPanel';

import { Proposal } from '../../utils/types/proposal';
import Notification from '../../utils/types/notification';
import { validateSciencePage } from '../../utils/proposalValidation';
import { UPLOAD_MAX_WIDTH_PDF } from '../../utils/constants';

const PAGE = 3;
const NOTIFICATION_DELAY_IN_SECONDS = 10;

export default function SciencePage() {
  const { t } = useTranslation('pht');
  const {
    application,
    helpComponent,
    updateAppContent1,
    updateAppContent2,
    updateAppContent5
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
      const proposal = getProposal();
      const signedUrl = await GetPresignedUploadUrl(`${proposal.id}-science.pdf`);

      if (typeof signedUrl != 'string') new Error('Not able to Get Science PDF Upload URL');

      const uploadResult = await PutUploadPDF(signedUrl, theFile);

      if (uploadResult.error) {
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

      NotifyOK('pdfUpload.science.success');
    } catch (e) {
      setFile(null);
      setUploadStatus(FileUploadStatus.ERROR);
    }
  };

  const downloadPDFToSignedUrl = async () => {
    try {
      const proposal = getProposal();
      const selectedFile = `${proposal.id}-` + t('pdfDownload.science.label') + t('fileType.pdf');
      const signedUrl = await GetPresignedDownloadUrl(selectedFile);

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
      const signedUrl = await GetPresignedDeleteUrl(`${proposal.id}-science.pdf`);

      if (typeof signedUrl != 'string') new Error('Not able to Get Science PDF Upload URL');

      const deleteResult = await DeleteDeletePDF(signedUrl);

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
      NotifyOK('pdfDelete.science.success');
    } catch (e) {
      new Error(t('pdfDelete.science.error'));
      NotifyError('pdfDelete.science.error');
    }
  };

  const previewSignedUrl = async () => {
    try {
      const proposal = getProposal();
      const selectedFile = `${proposal.id}-` + t('pdfDownload.science.label') + t('fileType.pdf');
      const signedUrl = await GetPresignedDownloadUrl(selectedFile);

      if (signedUrl === t('pdfDownload.sampleData') || proposal.sciencePDF != null) {
        setCurrentFile(signedUrl);
        setOpenPDFViewer(true);
      }
    } catch (e) {
      new Error(t('pdfDownload.error'));
    }
  };

  function Notify(str: string, lvl: typeof AlertColorTypes = AlertColorTypes.Info) {
    const rec: Notification = {
      level: lvl,
      delay: NOTIFICATION_DELAY_IN_SECONDS,
      message: t(str),
      okRequired: false
    };
    updateAppContent5(rec);
  }

  const NotifyError = (str: string) => Notify(str, AlertColorTypes.Error);
  const NotifyOK = (str: string) => Notify(str, AlertColorTypes.Success);

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
    <Grid2 pt={1} spacing={1} container direction="row" alignItems="center" justifyContent="center">
      <Grid2>
        {getProposal()?.sciencePDF?.isUploadedPdf && (
          <PDFPreviewButton
            title="pdfUpload.science.label.preview"
            toolTip="pdfUpload.science.tooltip.preview"
            action={previewSignedUrl}
          />
        )}
      </Grid2>
      <Grid2>
        {getProposal()?.sciencePDF?.isUploadedPdf && (
          <DownloadButton
            title="pdfUpload.science.label.download"
            toolTip="pdfUpload.science.tooltip.download"
            action={downloadPDFToSignedUrl}
          />
        )}
      </Grid2>
      <Grid2>
        {getProposal()?.sciencePDF?.isUploadedPdf && (
          <DeleteButton
            title={'pdfUpload.science.label.delete'}
            toolTip="pdfUpload.science.tooltip.delete"
            action={deletePdfUsingSignedUrl}
          />
        )}
      </Grid2>
    </Grid2>
  );

  return (
    <Shell page={PAGE}>
      <Grid2 container direction="row" alignItems="space-evenly" justifyContent="space-around">
        <Grid2 size={{ xs: 6 }}>
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
        </Grid2>
        <Grid2 pt={4} size={{ xs: 4 }}>
          <HelpPanel />
        </Grid2>
      </Grid2>
      {PDFView()}
    </Shell>
  );
}
