import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { FileUpload, FileUploadStatus } from '@ska-telescope/ska-gui-components';

interface TargetFileImportProps {
  raType: number;
}

export default function TargetFileImport({ raType }: TargetFileImportProps) {
  const { t } = useTranslation('pht');
  const [uploadButtonStatus, setUploadButtonStatus] = React.useState<FileUploadStatus>(null);

  const setFile = (theFile: File) => {
    console.log('theFile', theFile);
    //TODO: to decide when to set sciencePDF when adding the link in PUT endpoint
    //setProposal({ ...getProposal(), sciencePDF: theFile });
  };

  // const setUploadStatus = (status: FileUploadStatus) => {
  //   setProposal({ ...getProposal(), scienceLoadStatus: status });
  //   setUploadButtonStatus(status);
  // };

  const uploadPdftoSignedUrl = async theFile => {
    // setUploadStatus(FileUploadStatus.PENDING);
    // try {
    //   const proposal = getProposal();
    //   const prsl_id = proposal.id;
    //   const signedUrl = await GetPresignedUploadUrl(`${prsl_id}-science.pdf`);
    //   if (typeof signedUrl != 'string') new Error('Not able to Get Science PDF Upload URL');
    //   const uploadResult = await PutUploadPDF(signedUrl, theFile);
    //   if (uploadResult.error) {
    //     throw new Error('Science PDF Not Uploaded');
    //   }
    //   setUploadStatus(FileUploadStatus.OK);
    // } catch (e) {
    //   setFile(null);
    //   setUploadStatus(FileUploadStatus.ERROR);
    // }
  };

  return (
    <>
      <Typography>{raType}</Typography>

      <FileUpload
        chooseFileTypes=".csv"
        clearLabel={t('clearBtn.label')}
        clearToolTip={t('clearBtn.toolTip')}
        direction="column"
        //file={getProposal()?.sciencePDF}
        maxFileWidth={25}
        setFile={setFile}
        //setStatus={setUploadStatus}
        testId="fileUpload"
        uploadFunction={uploadPdftoSignedUrl}
        //status={uploadButtonStatus}
      />
    </>
  );
}
