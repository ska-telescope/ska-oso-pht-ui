import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { FileUpload, AlertColorTypes, FileUploadStatus } from '@ska-telescope/ska-gui-components';
import Papa from 'papaparse';
import { Proposal } from '../../../../utils/types/proposal';
import Notification from '../../../../utils/types/notification';
import { RA_TYPE_EQUATORIAL, UPLOAD_MAX_WIDTH_CSV } from '../../../../utils/constants';
import HelpPanel from '../../../../components/info/helpPanel/HelpPanel';

const NOTIFICATION_DELAY_IN_SECONDS = 10;

interface TargetFileImportProps {
  raType: number;
}

export default function TargetFileImport({ raType }: TargetFileImportProps) {
  const { t } = useTranslation('pht');

  const {
    application,
    helpComponent,
    updateAppContent2,
    updateAppContent5
  } = storageObject.useStore();
  const [uploadButtonStatus, setUploadButtonStatus] = React.useState<FileUploadStatus>(null);
  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  React.useEffect(() => {
    helpComponent(t('targetImport.help'));
  }, []);

  const AddTheTargetGalactic = (id, name, latitude, longitude) => {
    const newTarget = {
      //Default values from AddTarget.tsx
      dec: '',
      decUnit: raType.toString(),
      id,
      name,
      latitude,
      longitude,
      ra: '',
      raUnit: raType.toString(),
      redshift: null,
      referenceFrame: 0,
      vel: '',
      velUnit: '0'
    };

    return newTarget;
  };

  const AddTheTargetEquatorial = (id, name, ra, dec) => {
    const newTarget = {
      //Default values from AddTarget.tsx
      dec,
      decUnit: raType.toString(),
      id,
      name,
      latitude: null,
      longitude: null,
      ra,
      raUnit: raType.toString(),
      redshift: null,
      referenceFrame: 0,
      vel: '',
      velUnit: '0'
    };

    return newTarget;
  };

  const isSameHeader = (header1, header2) => {
    return JSON.stringify(header1) === JSON.stringify(header2);
  };

  const validateUploadCsv = async theFile => {
    const validEquatorialCsvHeader = ['name', 'ra', 'dec'];
    const validGalacticCsvHeader = ['name', 'longitude', 'latitude'];

    if (theFile) {
      Papa.parse(theFile, {
        header: true,
        skipEmptyLines: true,
        complete: result => {
          setUploadButtonStatus(FileUploadStatus.PENDING);
          try {
            const highestId = getProposal().targets.reduce(
              (acc, target) => (target.id > acc ? target.id : acc),
              -1
            );

            let errorInRows = false;
            let targets;

            if (raType === RA_TYPE_EQUATORIAL) {
              if (!isSameHeader(result.meta.fields, validEquatorialCsvHeader))
                throw t('uploadCsvBtn.uploadErrorEquatorialNotValidMsg');
              targets = result.data.reduce((result, target, index) => {
                if (target.name && target.ra && target.dec) {
                  result.push(
                    AddTheTargetEquatorial(
                      index + highestId + 1,
                      target.name,
                      target.ra,
                      target.dec
                    )
                  );
                } else {
                  errorInRows = true;
                }
                return result;
              }, []);
            } else {
              if (!isSameHeader(result.meta.fields, validGalacticCsvHeader))
                throw t('uploadCsvBtn.uploadErrorGalacticNotValidMsg');
              targets = result.data.reduce((result, target, index) => {
                if (target.name && target.latitude && target.longitude) {
                  result.push(
                    AddTheTargetGalactic(
                      index + highestId + 1,
                      target.name,
                      target.latitude,
                      target.longitude
                    )
                  );
                } else {
                  errorInRows = true;
                }
                return result;
              }, []);
            }
            setProposal({ ...getProposal(), targets: [...getProposal().targets, ...targets] });
            if (errorInRows) throw t('uploadCsvBtn.uploadErrorPartialMsg');
            setUploadButtonStatus(FileUploadStatus.OK);
            NotifyOK(t('uploadCsvBtn.uploadSuccessMsg'));
          } catch (e) {
            NotifyError(e);
            setUploadButtonStatus(FileUploadStatus.ERROR);
          }
        },
        error: message => {
          setUploadButtonStatus(FileUploadStatus.ERROR);
          NotifyError(t('uploadCsvBtn.uploadErrorUnknownParserMsg') + message);
        }
      });
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

  return (
    <Grid
      p={1}
      spacing={1}
      container
      direction="row"
      alignItems="flex-start"
      justifyContent="space-around"
    >
      <Grid item xs={7}>
        <FileUpload
          chooseToolTip={t('pdfUpload.science.tooltip.choose')}
          clearToolTip={t('clearBtn.tooltip')}
          dropzone
          dropzoneAccepted={{
            'application/csv': ['.csv']
          }}
          dropzoneIcons={false}
          dropzonePrompt={t('dropzone.prompt')}
          dropzonePreview={false}
          direction="row"
          maxFileWidth={UPLOAD_MAX_WIDTH_CSV}
          testId="csvUpload"
          uploadFunction={validateUploadCsv}
          uploadToolTip={t('pdfUpload.science.tooltip.upload')}
          status={uploadButtonStatus}
        />
      </Grid>
      <Grid pb={12} item xs={4}>
        <HelpPanel />
      </Grid>
    </Grid>
  );
}
