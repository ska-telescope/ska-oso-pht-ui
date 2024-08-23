import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes, FileUpload, FileUploadStatus } from '@ska-telescope/ska-gui-components';

import Shell from '../../components/layout/Shell/Shell';
import { Proposal } from '../../utils/types/proposal';
import PutUploadPDF from '../../services/axios/putUploadPDF/putUploadPDF';
import DeleteDeletePDF from '../../services/axios/deleteDeletePDF/deleteDeletePDF';

import GetPresignedDeleteUrl from '../../services/axios/getPresignedDeleteUrl/getPresignedDeleteUrl';
import GetPresignedDownloadUrl from '../../services/axios/getPresignedDownloadUrl/getPresignedDownloadUrl';
import GetPresignedUploadUrl from '../../services/axios/getPresignedUploadUrl/getPresignedUploadUrl';

import { validateSciencePage } from '../../utils/proposalValidation';
import DownloadButton from '../../components/button/Download/Download';
import DeleteButton from '../../components/button/Delete/Delete';
import PDFViewer from '../../components/layout/PDFViewer/PDFViewer';
import PDFPreviewButton from '../../components/button/PDFPreview/PDFPreview';

import Notification from '../../utils/types/notification';
import { UPLOAD_MAX_WIDTH_PDF } from '../../utils/constants';

const PAGE = 3;
const NOTIFICATION_DELAY_IN_SECONDS = 10;

export default function SciencePage() {
  const { t } = useTranslation('pht');
  const {
    application,
    updateAppContent1,
    updateAppContent2,
    updateAppContent5
  } = storageObject.useStore();
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
    if (theFile) {
      console.log('setFile if theFile');
      //TODO: to decide when to set sciencePDF when adding the link in PUT endpoint
      const file = {
        documentId: `science-doc-${getProposal().id}`,
        // link: (theFile as unknown) as string, TODO: remove dummy url STAR-658
        link: 'https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_100KB_PDF.pdf',
        file: theFile
      };
      setProposal({ ...getProposal(), sciencePDF: file });
      setCurrentFile(theFile);
    } else {
      console.log('setFile null');
      setProposal({ ...getProposal(), sciencePDF: null });
      setCurrentFile(null);
    }
  };

  const setUploadStatus = (status: FileUploadStatus) => {
    setProposal({ ...getProposal(), scienceLoadStatus: status });
    setUploadButtonStatus(status);
  };

  const uploadPdftoSignedUrl = async theFile => {
    setUploadStatus(FileUploadStatus.PENDING);

    try {
      const proposal = getProposal();
      const signedUrl = await GetPresignedUploadUrl(`${proposal.id}-science.pdf`);

      if (typeof signedUrl != 'string') new Error('Not able to Get Science PDF Upload URL');

      const uploadResult = await PutUploadPDF(signedUrl, theFile);

      if (uploadResult.error) {
        throw new Error('Science PDF Not Uploaded');
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
      setFile(null);
      setUploadStatus(FileUploadStatus.INITIAL);
      NotifyOK(t('pdfDelete.science.success'));
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

  function Notify(str: string, lvl: AlertColorTypes = AlertColorTypes.Info) {
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

  React.useEffect(() => {
    console.log('useEffect uploadButtonStatus', uploadButtonStatus);

    console.log('useEffect getProposal().scienceLoadStatus', getProposal().scienceLoadStatus);
    console.log('useEffect getProposal().sciencePDF', getProposal().sciencePDF);
  }, [uploadButtonStatus, getProposal().scienceLoadStatus, getProposal().sciencePDF]);

  return (
    <Shell page={PAGE}>
      {getProposal().scienceLoadStatus === FileUploadStatus.INITIAL && (
        <Grid container direction="row" alignItems="space-evenly" justifyContent="space-around">
          <Grid item xs={6}>
            <FileUpload
              chooseFileTypes=".pdf"
              clearLabel={t('clearBtn.label')}
              clearToolTip={t('clearBtn.toolTip')}
              direction="row"
              file={getProposal()?.sciencePDF?.file}
              maxFileWidth={25}
              setFile={setFile}
              setStatus={setUploadStatus}
              testId="fileUpload"
              uploadFunction={uploadPdftoSignedUrl}
              status={getProposal().scienceLoadStatus}
            />
          </Grid>
        </Grid>
      )}
      <Grid spacing={1} p={3} container direction="row" alignItems="center" justifyContent="center">
        <Grid item>
          {getProposal().sciencePDF != null &&
            getProposal().scienceLoadStatus === FileUploadStatus.OK && (
              <PDFPreviewButton toolTip={'pdfPreview.science'} action={previewSignedUrl} />
            )}
        </Grid>
        <Grid item>
          {getProposal().sciencePDF != null &&
            getProposal().scienceLoadStatus === FileUploadStatus.OK && (
              <DownloadButton
                toolTip={'pdfDownload.science.toolTip'}
                action={downloadPDFToSignedUrl}
              />
            )}
        </Grid>
        <Grid item>
          {getProposal().sciencePDF != null &&
            getProposal().scienceLoadStatus === FileUploadStatus.OK && (
              <DeleteButton
                toolTip={'pdfDelete.science.toolTip'}
                action={deletePdfUsingSignedUrl}
              />
            )}
        </Grid>
      </Grid>
      <PDFViewer open={openPDFViewer} onClose={handleClosePDFViewer} url={currentFile} />
    </Shell>
  );
}
