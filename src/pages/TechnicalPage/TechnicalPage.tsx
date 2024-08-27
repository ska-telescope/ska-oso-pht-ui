import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes, FileUpload, FileUploadStatus } from '@ska-telescope/ska-gui-components';

import Shell from '../../components/layout/Shell/Shell';
import { Proposal } from '../../utils/types/proposal';
import DeleteDeletePDF from '../../services/axios/deleteDeletePDF/deleteDeletePDF';
import PutUploadPDF from '../../services/axios/putUploadPDF/putUploadPDF';
import GetPresignedDeleteUrl from '../../services/axios/getPresignedDeleteUrl/getPresignedDeleteUrl';
import GetPresignedDownloadUrl from '../../services/axios/getPresignedDownloadUrl/getPresignedDownloadUrl';
import GetPresignedUploadUrl from '../../services/axios/getPresignedUploadUrl/getPresignedUploadUrl';

import { validateTechnicalPage } from '../../utils/proposalValidation';
import DownloadButton from '../../components/button/Download/Download';
import PDFViewer from '../../components/layout/PDFViewer/PDFViewer';
import PDFPreviewButton from '../../components/button/PDFPreview/PDFPreview';
import DeleteButton from '../../components/button/Delete/Delete';

import Notification from '../../utils/types/notification';
import { UPLOAD_MAX_WIDTH_PDF } from '../../utils/constants';

const PAGE = 6;
const NOTIFICATION_DELAY_IN_SECONDS = 5;

export default function TechnicalPage() {
  const { t } = useTranslation('pht');
  const {
    application,
    updateAppContent1,
    updateAppContent2,
    updateAppContent5
  } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);
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

  const setUploadStatus = (status: FileUploadStatus) => {
    setProposal({ ...getProposal(), technicalLoadStatus: status });
  };

  const setFile = (theFile: File) => {
    if (theFile) {
      //TODO: to decide when to set technicalPDF when adding the link in PUT endpoint
      const file = {
        documentId: `technical-doc-${getProposal().id}`,
        // link: (theFile as unknown) as string, TODO: remove dummy url STAR-658
        link: 'https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_100KB_PDF.pdf',
        file: theFile
      };
      setProposal({ ...getProposal(), technicalPDF: file });
      setCurrentFile(theFile);
    } else {
      setProposal((({ technicalPDF, ...rest }) => rest)(getProposal()));
      setCurrentFile(null);
    }
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

  const deletePdfUsingSignedUrl = async () => {
    try {
      const proposal = getProposal();
      const signedUrl = await GetPresignedDeleteUrl(`${proposal.id}-technical.pdf`);

      if (typeof signedUrl != 'string') new Error('Not able to Get Technical PDF Upload URL');

      const deleteResult = await DeleteDeletePDF(signedUrl);

      if (deleteResult.error || deleteResult === 'error.API_UNKNOWN_ERROR') {
        throw new Error('Not able to delete Technical PDF');
      }
      setFile(null); //TODO: revisit redux not removed after delete pdf
      setUploadStatus(FileUploadStatus.INITIAL);
      NotifyOK(t('pdfDelete.technical.success'));
    } catch (e) {
      new Error(t('pdfDelete.technical.error'));
      NotifyError(t('pdfDelete.technical.error'));
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
    if (getProposal()?.technicalLoadStatus === null) {
      setUploadStatus(FileUploadStatus.INITIAL);
    }
  }, [getProposal()]);

  React.useEffect(() => {
    setTheProposalState(validateTechnicalPage(getProposal()));
  }, [validateToggle]);

  return (
    <Shell page={PAGE}>
      {getProposal().technicalLoadStatus === FileUploadStatus.INITIAL && (
        <Grid container direction="row" alignItems="space-evenly" justifyContent="space-around">
          <Grid item xs={6}>
            <FileUpload
              chooseFileTypes=".pdf"
              chooseLabel={t('pdfUpload.technical.label.choose')}
            chooseToolTip={t('pdfUpload.technical.tooltip.choose')}
            clearLabel={t('pdfUpload.technical.label.clear')}
              clearToolTip={t('pdfUpload.technical.tooltip.clear')}
              direction="row"
              file={getProposal()?.technicalPDF?.file}
              maxFileWidth={UPLOAD_MAX_WIDTH_PDF}
              setFile={setFile}
              setStatus={setUploadStatus}
              testId="fileUpload"
              uploadFunction={uploadPdftoSignedUrl}
              uploadToolTip={t('pdfUpload.technical.tooltip.upload')}
            status={getProposal().technicalLoadStatus}
            />
          </Grid>
        </Grid>
      )}
      <Grid spacing={1} p={3} container direction="row" alignItems="center" justifyContent="center">
        <Grid item>
          {getProposal().technicalPDF != null &&
            getProposal().technicalLoadStatus === FileUploadStatus.OK && (
              <PDFPreviewButton
              title="pdfUpload.technical.label.preview"
              toolTip="pdfUpload.technical.tooltip.preview"
              action={previewSignedUrl}
            />
            )}
        </Grid>
        <Grid item>
          {getProposal().technicalPDF != null &&
            getProposal().technicalLoadStatus === FileUploadStatus.OK && (
              <DownloadButton
                title="pdfUpload.technical.label.download"
              toolTip="pdfUpload.technical.tooltip.download"
                action={downloadPDFToSignedUrl}
              />
            )}
        </Grid>
        <Grid item>
          {getProposal().technicalPDF != null &&
            getProposal().technicalLoadStatus === FileUploadStatus.OK && (
              <DeleteButton
                title={'pdfUpload.technical.label.delete'}
                toolTip={'pdfDelete.technical.toolTip'}
                action={deletePdfUsingSignedUrl}
              />
            )}
        </Grid>
      </Grid>

      <PDFViewer open={openPDFViewer} onClose={handleClosePDFViewer} url={currentFile} />
    </Shell>
  );
}
