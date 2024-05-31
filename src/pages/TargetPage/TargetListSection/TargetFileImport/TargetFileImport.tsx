import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid } from '@mui/material';
import { Proposal } from '../../../../utils/types/proposal';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { FileUpload, AlertColorTypes, FileUploadStatus } from '@ska-telescope/ska-gui-components';
import Notification from '../../../../utils/types/notification';
import Papa from 'papaparse';

const NOTIFICATION_DELAY_IN_SECONDS = 10;

interface TargetFileImportProps {
  raType: number;
}

export default function TargetFileImport({ raType }: TargetFileImportProps) {
  const { t } = useTranslation('pht');

  const { application, updateAppContent2, updateAppContent5 } = storageObject.useStore();
  const [uploadButtonStatus, setUploadButtonStatus] = React.useState<FileUploadStatus>(null);
  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

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
            if (raType === 0) {
              if (JSON.stringify(result.meta.fields) !== JSON.stringify(validEquatorialCsvHeader))
                throw t('uploadCsvBtn.uploadErrorEquatorialNotValidMsg');
              const targets = result.data.reduce((result, target, index) => {
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
              setProposal({ ...getProposal(), targets: [...getProposal().targets, ...targets] });
            } else {
              if (JSON.stringify(result.meta.fields) !== JSON.stringify(validGalacticCsvHeader))
                throw t('uploadCsvBtn.uploadErrorGalacticNotValidMsg');
              const targets = result.data.reduce((result, target, index) => {
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
              setProposal({ ...getProposal(), targets: [...getProposal().targets, ...targets] });
            }
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
    <Grid p={2}>
      <FileUpload
        chooseLabel={t('uploadCsvBtn.label')}
        chooseFileTypes=".csv"
        clearLabel={t('clearBtn.label')}
        clearToolTip={t('clearBtn.toolTip')}
        direction="row"
        maxFileWidth={25}
        //setFile={setFile}
        testId="csvUpload"
        uploadFunction={validateUploadCsv}
        status={uploadButtonStatus}
      />
    </Grid>
  );
}
