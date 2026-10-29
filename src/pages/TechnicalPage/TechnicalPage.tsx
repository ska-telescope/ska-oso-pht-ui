import React from 'react';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import { Grid } from '@mui/material';
import { useController } from 'react-hook-form';
import { storageObject } from '@utils/storage/store';
import { FileUpload, FileUploadStatus } from '@ska-telescope/ska-gui-components';
import DeletePDF from '@services/axios/delete/deletePDF/deletePDF.tsx';
import PutUploadPDF from '@services/axios/put/putUploadPDF/putUploadPDF';
import GetPresignedDeleteUrl from '@services/axios/get/getPresignedDeleteUrl/getPresignedDeleteUrl';
import GetPresignedDownloadUrl from '@services/axios/get/getPresignedDownloadUrl/getPresignedDownloadUrl';
import GetPresignedUploadUrl from '@services/axios/get/getPresignedUploadUrl/getPresignedUploadUrl';
import { Proposal } from '../../utils/types/proposal';
import Shell from '../../components/layout/Shell/Shell';
import { getDocumentPageStatus, isSameDocumentRef } from '@/models/proposals/documents';
import { ProposalType } from '@/models/proposals/proposal';
import DownloadButton from '../../components/button/Download/Download';
import PDFWrapper from '../../components/layout/PDFWrapper/PDFWrapper';
import PDFPreviewButton from '../../components/button/PDFPreview/PDFPreview';
import DeleteButton from '../../components/button/Delete/Delete';
import {
  NOTIFICATION_DELAY_IN_SECONDS,
  PAGE_TECHNICAL,
  UPLOAD_MAX_WIDTH_PDF
} from '../../utils/constants';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import { useNotify } from '@/utils/notify/useNotify';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';

const PAGE = PAGE_TECHNICAL;

export default function TechnicalPage() {
  const { t } = useScopedTranslation();
  const { notifyError, notifyWarning, notifySuccess } = useNotify();
  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const {
    field: { value: technicalPDF, onChange: onTechnicalPdfChange }
  } = useController<ProposalType, 'technicalPDF'>({ name: 'technicalPDF' });
  const {
    field: { value: technicalLoadStatus, onChange: onTechnicalLoadStatusChange }
  } = useController<ProposalType, 'technicalLoadStatus'>({ name: 'technicalLoadStatus' });
  const [currentFile, setCurrentFile] = React.useState<string | null | undefined>(null);
  const [originalFile, setOriginalFile] = React.useState<string | null>(null);

  const [openPDFViewer, setOpenPDFViewer] = React.useState(false);
  const loggedIn = isLoggedIn();
  const { setHelp } = useHelp();

  const isDisableEndpoints = () => !loggedIn;

  const handleClosePDFViewer = () => setOpenPDFViewer(false);

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);
  const { axiosClient: authClient } = useAxiosAuthClient();

  const getProposalState = () => application.content1 as number[];
  const setTheProposalState = (value: number) => {
    const temp: number[] = [];
    for (let i = 0; i < getProposalState().length; i++) {
      temp.push(PAGE === i ? value : getProposalState()[i]);
    }
    updateAppContent1(temp);
  };

  const setUploadStatus = (status: typeof FileUploadStatus) => {
    onTechnicalLoadStatusChange(status);
  };

  const setFile = (theFile: File | '') => {
    if (!(theFile instanceof File)) {
      onTechnicalPdfChange(null);
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

      onTechnicalPdfChange(technicalPDFUploaded);
      onTechnicalLoadStatusChange(FileUploadStatus.OK);
      notifySuccess(t('pdfUpload.technical.success'), NOTIFICATION_DELAY_IN_SECONDS);
    } catch (e) {
      setFile('');
      setUploadStatus(FileUploadStatus.ERROR);
    }
  };

  const downloadPDFToSignedUrl = async () => {
    try {
      const proposal = getProposal();
      const selectedFile = `${proposal.id}-` + t('pdfDownload.technical.label') + t('fileType.pdf');
      const signedUrl = await GetPresignedDownloadUrl(authClient, selectedFile);

      if (signedUrl === t('pdfDownload.sampleData') || technicalPDF != null) {
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

      onTechnicalPdfChange(technicalPDFDeleted);
      onTechnicalLoadStatusChange(FileUploadStatus.INITIAL);

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

      if (signedUrl === t('pdfDownload.sampleData') || technicalPDF != null) {
        setCurrentFile(signedUrl);
        setOpenPDFViewer(true);
      }
    } catch (e) {
      new Error(t('pdfDownload.error'));
    }
  };

  React.useEffect(() => {
    if (technicalPDF?.documentId) {
      setCurrentFile(technicalPDF.documentId);
      setOriginalFile(technicalPDF.documentId + t('fileType.pdf'));
    }
    setHelp('page.' + PAGE);
  }, []);

  React.useEffect(() => {
    if (technicalLoadStatus == null) {
      setUploadStatus(FileUploadStatus.INITIAL);
    }
  }, [technicalLoadStatus]);

  // Bridge: unmigrated consumers and the save path still read the legacy store.
  React.useEffect(() => {
    const proposal = getProposal();
    if (
      !isSameDocumentRef(proposal?.technicalPDF, technicalPDF) ||
      (proposal?.technicalLoadStatus ?? null) !== (technicalLoadStatus ?? null)
    ) {
      setProposal({
        ...proposal,
        technicalPDF: technicalPDF ?? null,
        technicalLoadStatus: technicalLoadStatus ?? undefined
      });
    }
  }, [technicalPDF, technicalLoadStatus]);

  React.useEffect(() => {
    setTheProposalState(getDocumentPageStatus(technicalPDF));
  }, [technicalPDF]);

  const renderPDFView = () => (
    <PDFWrapper open={openPDFViewer} onClose={handleClosePDFViewer} url={currentFile ?? ''} />
  );

  const uploadSuffix = () => (
    <Grid
      spacing={1}
      container
      direction="row"
      sx={{
        pt: 1,
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Grid>
        {technicalPDF?.isUploadedPdf && (
          <PDFPreviewButton
            title="pdfUpload.technical.label.preview"
            toolTip="pdfUpload.technical.tooltip.preview"
            action={previewSignedUrl}
          />
        )}
      </Grid>
      <Grid>
        {technicalPDF?.isUploadedPdf && (
          <DownloadButton
            title="pdfUpload.technical.label.download"
            toolTip="pdfUpload.technical.tooltip.download"
            action={downloadPDFToSignedUrl}
          />
        )}
      </Grid>
      <Grid>
        {technicalPDF?.isUploadedPdf && (
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
      <Grid
        container
        direction="row"
        sx={{
          alignItems: 'space-evenly',
          justifyContent: 'space-around'
        }}
      >
        <Grid size={{ xs: 6 }} data-testid="fileUpload">
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
              status={technicalLoadStatus ?? undefined}
              suffix={technicalPDF?.documentId ? uploadSuffix() : <></>}
            />
          )}
        </Grid>
      </Grid>
      {renderPDFView()}
    </Shell>
  );
}
