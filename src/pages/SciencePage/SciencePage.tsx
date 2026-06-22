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
  const [fileUploadKey, setFileUploadKey] = React.useState(0);
  const validationFileRef = React.useRef<File | null>(null);

  const [openPDFViewer, setOpenPDFViewer] = React.useState(false);

  const loggedIn = isLoggedIn();
  const authClient = useAxiosAuthClient();

  const isDisableEndpoints = () => !loggedIn && !cypressToken;

  const handleClosePDFViewer = () => setOpenPDFViewer(false);

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const getSciencePdfDisplayFilename = () =>
    getProposal()?.sciencePDF?.documentId + t('fileType.pdf');

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
      if (getProposal()?.sciencePDF?.isUploadedPdf) {
        /*
         * FileUpload has no dedicated prop to disable dropzone file acceptance while preserving
         * the dropzone prompt/preview. Guarding here blocks replacement attempts until delete.
         */
        return;
      }
      validationFileRef.current = theFile;
      validatePdf(theFile)
        .then(error => {
          if (validationFileRef.current === theFile) {
            setPdfError(error);
            if (error !== null) {
              /*
               * key={fileUploadKey}: FileUpload owns its displayed filename in internal
               * React state, and setting the `file` prop to null/'' does not clear it
               * (the component's useEffect guard is `v && …`, so falsy values are ignored).
               * Incrementing the key forces React to unmount the old instance and mount a
               * fresh one — resetting the filename display — whenever validation rejects a
               * file.
               */
              setFileUploadKey(k => k + 1);
            }
          }
        })
        .catch(() => {
          if (validationFileRef.current === theFile) {
            setPdfError(t('pdfUpload.science.invalidFileError'));
            setFileUploadKey(k => k + 1);
          }
        });
    } else {
      const hasUploadedSciencePdf = !!getProposal()?.sciencePDF?.isUploadedPdf;
      validationFileRef.current = null;
      setPdfError(null);
      /*
       * FileUpload has no controlled-clear API: its file-prop sync effect ignores falsy values, so
       * clearing the displayed name needs both (a) a remount via the key to reset its internal
       * filename state and (b) originalFile (the `file` prop) set to null, since the dropzone
       * renders the `file` prop directly as the selected file.
       * TODO: switch to a first-class ska-gui-components API when available.
       */
      setFileUploadKey(k => k + 1);
      if (hasUploadedSciencePdf) {
        setOriginalFile(getSciencePdfDisplayFilename());
      } else {
        setOriginalFile(null);
        setProposal({
          ...getProposal(),
          sciencePDF: null
        });
        setCurrentFile(null);
      }
    }
  };

  const setUploadStatus = (status: typeof FileUploadStatus) => {
    setProposal({ ...getProposal(), scienceLoadStatus: status });
  };

  const validateSelectedFile = (selectedFile: File) => {
    validationFileRef.current = selectedFile;
    validatePdf(selectedFile)
      .then(error => {
        if (validationFileRef.current === selectedFile) {
          setPdfError(error);
        }
      })
      .catch(() => {
        if (validationFileRef.current === selectedFile) {
          setPdfError(t('pdfUpload.science.invalidFileError'));
        }
      });
  };

  const isAcceptedPdfFile = (file: File) => {
    const isPdfByMime = file.type === 'application/pdf';
    const isPdfByExtension = file.name.toLowerCase().endsWith('.pdf');
    return isPdfByMime || isPdfByExtension;
  };

  const rejectInvalidNonPdfSelection = (file: File) => {
    validationFileRef.current = file;
    setPdfError(t('pdfUpload.science.invalidFileError'));
    /*
     * Workaround for missing FileUpload rejection hooks/state control:
     * when dropzone rejects non-PDF files, setFile is not called, so FileUpload keeps internal
     * "selected file" state and keeps clear/upload buttons visible unless we remount it.
     */
    setFileUploadKey(k => k + 1);
  };

  /**
   * Capture file-input changes emitted from inside FileUpload so we can validate selected files
   * even when react-dropzone rejects them before FileUpload calls setFile (for example, when the
   * picker starts with PDF filters but users switch to "all files" and pick a non-PDF).
   *
   * This is required to show the same invalid-file warning for picker-based non-PDF selections.
   *
   * This is moderately brittle:
   *  - it assumes FileUpload renders a native <input type="file"> inside that wrapper.                                                                                                                                                                                                                                ┃
   *  - it assumes the input change event bubbles/captures through the box wrapper.                                                                                                                                                                                                                                       ┃
   *  - if ska-gui-components changes DOM structure, portals the input elsewhere, or changes event
   *    handling, this hook could stop firing.                                                                                                                                                                              ┃
   *
   * Longer term, the better fix is a first-class rejection callback in GUI component FileUpload
   * (for example onDropRejected/onFileRejected) and moving this warning handling to that API.
   */
  const handleFileInputChangeCapture = (event: React.FormEvent<HTMLDivElement>) => {
    if (getProposal()?.sciencePDF?.isUploadedPdf) {
      return;
    }

    const target = event.target as HTMLInputElement;
    if (target.tagName !== 'INPUT' || target.type !== 'file' || !target.files?.length) {
      return;
    }

    const selectedFile = target.files[0];
    if (!isAcceptedPdfFile(selectedFile)) {
      rejectInvalidNonPdfSelection(selectedFile);
      return;
    }

    validateSelectedFile(selectedFile);
  };

  const blockUploadInteractionWhenPdfExists = (
    event: React.SyntheticEvent<HTMLDivElement, Event>
  ) => {
    if (!getProposal()?.sciencePDF?.isUploadedPdf) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }

    /*
     * Workaround for missing FileUpload "disable dropzone interactions" API:
     * prevent dropzone clicks/drops from opening file picker or accepting files while a PDF is
     * already uploaded, but keep suffix action buttons (delete/preview/download) usable.
     */
    event.preventDefault();
    event.stopPropagation();
  };

  /**
   * Workaround for missing FileUpload rejection hooks:
   * FileUpload does not expose react-dropzone's onDropRejected / fileRejections, so rejected
   * non-PDF drag/drop attempts never call setFile and otherwise provide no invalid-file feedback.
   * Capturing drop events here lets SciencePage surface invalidFileError consistently.
   */
  const handleDropCapture = (event: React.DragEvent<HTMLDivElement>) => {
    if (getProposal()?.sciencePDF?.isUploadedPdf) {
      blockUploadInteractionWhenPdfExists(event);
      return;
    }

    const droppedFile = event.dataTransfer.files?.[0];
    if (!droppedFile) {
      return;
    }
    if (isAcceptedPdfFile(droppedFile)) {
      return;
    }

    rejectInvalidNonPdfSelection(droppedFile);
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

      /*
       * SW: sciencePDF was set to sciencePDFDeleted. It seems deliberate, but I don't know why
       * it would be done as it had the effect of making it look like a phantom PDF had been
       * uploaded.
       */
      // const sciencePDFDeleted = {
      //   documentId: `science-doc-${proposal.id}`,
      //   isUploadedPdf: false
      // };

      setProposal({
        ...getProposal(),
        sciencePDF: null,
        scienceLoadStatus: FileUploadStatus.INITIAL
      });

      /*
       * FileUpload has no controlled-clear API: its file-prop sync effect ignores falsy values, so
       * clearing the displayed name after delete needs both (a) a remount via the key to reset its
       * internal filename state and (b) originalFile (the `file` prop) set to null, since the
       * dropzone renders the `file` prop directly as the selected file. Until a first-class
       * controlled clear API exists in ska-gui-components.
       */
      setFileUploadKey(k => k + 1);
      setOriginalFile(null);
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
      setOriginalFile(getSciencePdfDisplayFilename());
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

  const hasUploadedSciencePdf = !!getProposal()?.sciencePDF?.isUploadedPdf;
  const dropzonePrompt = hasUploadedSciencePdf
    ? t('pdfUpload.science.prompt.deleteToEnableUpload')
    : t('dropzone.prompt');

  return (
    <Shell page={PAGE}>
      <Grid container direction="row" alignItems="space-evenly" justifyContent="space-around">
        <Grid size={{ xs: 6 }} data-testid="fileUpload">
          {isDisableEndpoints() ? (
            <>{t('pdfUpload.disabled')}</>
          ) : (
            <>
              <Box
                onClickCapture={blockUploadInteractionWhenPdfExists}
                onChangeCapture={handleFileInputChangeCapture}
                onDragOverCapture={blockUploadInteractionWhenPdfExists}
                onDropCapture={handleDropCapture}
                sx={{
                  '& .MuiButton-root.Mui-disabled': {
                    opacity: 0.38
                  },
                  ...(hasUploadedSciencePdf
                    ? {
                        /*
                         * Workaround for FileUpload limitations:
                         * we need `file` set so the uploaded filename is shown, but FileUpload ties
                         * clear/upload button visibility to internal selected-file state. Hide those
                         * buttons while an uploaded PDF already exists.
                         */
                        '& [data-testid="fileUploadClearButton"], & [data-testid="fileUploadUploadButton"]':
                          {
                            display: 'none'
                          }
                      }
                    : {})
                }}
              >
                <FileUpload
                  key={fileUploadKey}
                  chooseDisabled={hasUploadedSciencePdf}
                  chooseToolTip={t('pdfUpload.science.tooltip.choose')}
                  clearLabel={t('clearBtn.label')}
                  clearToolTip={t('pdfUpload.science.tooltip.clear')}
                  dropzone
                  dropzoneAccepted={{
                    'application/pdf': ['.pdf']
                  }}
                  dropzoneIcons={false}
                  dropzonePrompt={dropzonePrompt}
                  dropzonePreview={false}
                  direction="row"
                  file={originalFile}
                  maxFileWidth={UPLOAD_MAX_WIDTH_PDF}
                  setFile={setFile}
                  setStatus={setUploadStatus}
                  testId="fileUpload"
                  clearDisabled={!!getProposal()?.sciencePDF?.isUploadedPdf && !pdfError}
                  uploadDisabled={hasUploadedSciencePdf || !!pdfError}
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
              {pdfError && (
                <FormHelperText error sx={{ ml: 1.75 }}>
                  {pdfError}
                </FormHelperText>
              )}
            </>
          )}
        </Grid>
      </Grid>
      {PDFView()}
    </Shell>
  );
}
