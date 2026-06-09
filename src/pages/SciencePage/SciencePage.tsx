import React from 'react';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import { Box, FormHelperText, Grid } from '@mui/material';
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
import { Proposal } from '@utils/types/proposal.tsx';
import { validateSciencePage } from '@utils/validation/validation.tsx';
import {
  cypressToken,
  PAGE_DESCRIPTION,
  SCIENCE_PDF_MAX_PAGES,
  SCIENCE_PDF_MAX_SIZE_MB,
  UPLOAD_MAX_WIDTH_PDF
} from '@utils/constants.ts';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import { useNotify } from '@/utils/notify/useNotify';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import { getPdfPageCount } from '@/utils/pdf/pdfPageCount';

const PAGE = PAGE_DESCRIPTION;

export default function SciencePage() {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const { notifyError, notifyWarning, notifySuccess } = useNotify();
  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [currentFile, setCurrentFile] = React.useState<string | null | undefined>(null);
  const [originalFile, setOriginalFile] = React.useState<string | null>(null);
  const [pdfError, setPdfError] = React.useState<string | null>(null);
  const validationFileRef = React.useRef<File | null>(null);

  const [openPDFViewer, setOpenPDFViewer] = React.useState(false);

  const loggedIn = isLoggedIn();
  const authClient = useAxiosAuthClient();

  const isDisableEndpoints = () => !loggedIn && !cypressToken;

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

  const validatePdf = async (file: File): Promise<string | null> => {
    const sizeBytes = file.size;
    const maxBytes = SCIENCE_PDF_MAX_SIZE_MB * 1024 * 1024;
    if (sizeBytes > maxBytes) {
      const currentMB = parseFloat((sizeBytes / (1024 * 1024)).toFixed(2));
      return t('pdfUpload.science.sizeError', { current: currentMB, max: SCIENCE_PDF_MAX_SIZE_MB });
    }
    try {
      const pageCount = await getPdfPageCount(file);
      if (pageCount > SCIENCE_PDF_MAX_PAGES) {
        return t('pdfUpload.science.pageError', { current: pageCount, max: SCIENCE_PDF_MAX_PAGES });
      }
      return null;
    } catch {
      return t('pdfUpload.science.invalidFileError');
    }
  };

  const setFile = (theFile: File | '') => {
    if (theFile instanceof File) {
      validationFileRef.current = theFile;
      validatePdf(theFile).then(error => {
        if (validationFileRef.current === theFile) {
          setPdfError(error);
        }
      });
    } else {
      validationFileRef.current = null;
      setPdfError(null);
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
    const error = await validatePdf(theFile);
    if (error !== null) {
      setPdfError(error);
      return;
    }
    setPdfError(null);
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
      setFile('');
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
    setHelp('page.' + PAGE + '.help');
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
        <Grid size={{ xs: 6 }} data-testid="fileUpload">
          {isDisableEndpoints() ? (
            <>{t('pdfUpload.disabled')}</>
          ) : (
            <>
              <Box
                sx={{
                  '& [data-testid="fileUploadUploadButton"].Mui-disabled': {
                    opacity: 0.38
                  }
                }}
              >
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
                  uploadDisabled={!!pdfError}
                  uploadFunction={uploadPdftoSignedUrl}
                  uploadToolTip={
                    pdfError
                      ? t('pdfUpload.science.tooltip.uploadDisabled')
                      : t('pdfUpload.science.tooltip.upload')
                  }
                  status={getProposal().scienceLoadStatus}
                  suffix={uploadSuffix()}
                />
              </Box>
              {pdfError && <FormHelperText error sx={{ ml: 1.75 }}>{pdfError}</FormHelperText>}
            </>
          )}
        </Grid>
      </Grid>
      {PDFView()}
    </Shell>
  );
}
