import React from 'react';
import { useMsal } from '@azure/msal-react';
import { useTranslation } from 'react-i18next';
import { Grid2 } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes, FileUpload, FileUploadStatus } from '@ska-telescope/ska-gui-components';

import Shell from '../../components/layout/Shell/Shell';
import HelpPanel from '../../components/info/helpPanel/HelpPanel';
import { Proposal } from '../../utils/types/proposal';
import DeleteDeletePDF from '../../services/axios/deleteDeletePDF/deleteDeletePDF';
import PutUploadPDF from '../../services/axios/putUploadPDF/putUploadPDF';
import GetPresignedDeleteUrl from '../../services/axios/getPresignedDeleteUrl/getPresignedDeleteUrl';
import GetPresignedDownloadUrl from '../../services/axios/getPresignedDownloadUrl/getPresignedDownloadUrl';
import GetPresignedUploadUrl from '../../services/axios/getPresignedUploadUrl/getPresignedUploadUrl';

import { validateTechnicalPage } from '../../utils/proposalValidation';
import DownloadButton from '../../components/button/Download/Download';
import PDFWrapper from '../../components/layout/PDFWrapper/PDFWrapper';
import PDFPreviewButton from '../../components/button/PDFPreview/PDFPreview';
import DeleteButton from '../../components/button/Delete/Delete';

import Notification from '../../utils/types/notification';
import { UPLOAD_MAX_WIDTH_PDF } from '../../utils/constants';
import { useMockedLogin } from '@/contexts/MockedLoginContext';

const PAGE = 6;
const NOTIFICATION_DELAY_IN_SECONDS = 5;

export default function TechnicalPage() {
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

  const { isMockedLoggedIn } = useMockedLogin();

  const { accounts } = useMsal();
  const isLoggedIn = () => accounts.length > 0;

  const isDisableEndpoints = () => !isLoggedIn() && !isMockedLoggedIn;

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
      const proposal = getProposal();
      const signedUrl = await GetPresignedUploadUrl(`${proposal.id}-technical.pdf`);

      if (typeof signedUrl != 'string') new Error('Not able to Get Technical PDF Upload URL');

      const uploadResult = await PutUploadPDF(signedUrl, theFile);

      if (uploadResult.error) {
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
      NotifyOK('pdfUpload.technical.success');
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

  const deletePdfUsingSignedUrl = async () => {
    try {
      const proposal = getProposal();
      const signedUrl = await GetPresignedDeleteUrl(`${proposal.id}-technical.pdf`);

      if (typeof signedUrl != 'string') new Error('Not able to Get Technical PDF Upload URL');

      const deleteResult = await DeleteDeletePDF(signedUrl);

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

      NotifyOK('pdfDelete.technical.success');
    } catch (e) {
      new Error(t('pdfDelete.technical.error'));
      NotifyError('pdfDelete.technical.error');
    }
  };

  const previewSignedUrl = async () => {
    try {
      const proposal = getProposal();
      const selectedFile = `${proposal.id}-` + t('pdfDownload.technical.label') + t('fileType.pdf');
      const signedUrl = await GetPresignedDownloadUrl(selectedFile);

      if (signedUrl === t('pdfDownload.sampleData') || proposal.technicalPDF != null) {
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
    <Grid2 pt={1} spacing={1} container direction="row" alignItems="center" justifyContent="center">
      <Grid2>
        {getProposal().technicalPDF?.isUploadedPdf && (
          <PDFPreviewButton
            title="pdfUpload.technical.label.preview"
            toolTip="pdfUpload.technical.tooltip.preview"
            action={previewSignedUrl}
          />
        )}
      </Grid2>
      <Grid2>
        {getProposal().technicalPDF?.isUploadedPdf && (
          <DownloadButton
            title="pdfUpload.technical.label.download"
            toolTip="pdfUpload.technical.tooltip.download"
            action={downloadPDFToSignedUrl}
          />
        )}
      </Grid2>
      <Grid2>
        {getProposal().technicalPDF?.isUploadedPdf && (
          <DeleteButton
            title={'pdfUpload.technical.label.delete'}
            toolTip="pdfUpload.technical.tooltip.delete"
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
        </Grid2>
        <Grid2 pt={4} size={{ xs: 4 }}>
          <HelpPanel />
        </Grid2>
      </Grid2>
      {PDFView()}
    </Shell>
  );
}
