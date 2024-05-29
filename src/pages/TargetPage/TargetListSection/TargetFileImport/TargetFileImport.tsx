import React from 'react';
import { useTranslation } from 'react-i18next';
import { Proposal } from '../../../../utils/types/proposal';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { FileUpload, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import TimedAlert from '../../../../components/alerts/timedAlert/TimedAlert';
import Papa from 'papaparse';

interface TargetFileImportProps {
  raType: number;
}

export default function TargetFileImport({ raType }: TargetFileImportProps) {
  const { t } = useTranslation('pht');

  const { application, updateAppContent2 } = storageObject.useStore();
  const [uploadCsvError, setUploadCsvError] = React.useState('');
  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const AddTheTargetGalatic = (id, name, latitude, longitude) => {
    console.log('AddTheTarget name', name);
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
    console.log('AddTheTarget name', name);
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
    console.log('uploadPdftoSignedUrl theFile', theFile);

    const validEquatorialCsvHeader = ['name', 'ra', 'dec'];
    const validGalacticCsvHeader = ['name', 'longitude', 'latitude'];

    if (theFile) {
      setUploadCsvError('');

      Papa.parse(theFile, {
        header: true,
        skipEmptyLines: true,
        complete: result => {
          try {
            console.log('papa result', result);
            console.log('papa result.data', result.data);

            const highestId = getProposal().targets.reduce(
              (acc, target) => (target.id > acc ? target.id : acc),
              -1
            );
            console.log('highestId', highestId);

            //check schema
            let errorInRows = false;
            if (raType === 0) {
              //equatorial
              console.log('validEquatorialCsvHeader', validEquatorialCsvHeader);
              console.log('result.header equatorial', result.meta.fields);
              // check
              if (JSON.stringify(result.meta.fields) !== JSON.stringify(validEquatorialCsvHeader))
                throw 'CSV equatorial schema not valid';
              console.log('equatorial ok');
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
                  console.log('equatorial null found');
                  errorInRows = true;
                }
                return result;
              }, []);
              console.log('targets', targets);
              console.log('targets appended', [...getProposal().targets, ...targets]);
              setProposal({ ...getProposal(), targets: [...getProposal().targets, ...targets] });
            } else {
              //galactic
              if (JSON.stringify(result.meta.fields) !== JSON.stringify(validGalacticCsvHeader))
                throw 'CSV galactic schema not valid';
              console.log('galactic ok');
              const targets = result.data.reduce((result, target, index) => {
                if (target.name && target.latitude && target.longitude) {
                  result.push(
                    AddTheTargetGalatic(
                      index + highestId + 1,
                      target.name,
                      target.latitude,
                      target.longitude
                    )
                  );
                } else {
                  console.log('galactic null found');
                  errorInRows = true;
                }
                return result;
              }, []);
              console.log('targets', targets);
              console.log('targets appended', [...getProposal().targets, ...targets]);
              setProposal({ ...getProposal(), targets: [...getProposal().targets, ...targets] });
            }
            if (errorInRows)
              throw 'Partialy uploaded - some rows contain empty values which will be omitted';
          } catch (e) {
            console.log('error in catch ', e);
            setUploadCsvError(e);
          }
        },
        error: message => {
          console.log('papa error message', message);
        }
      });
    }
  };

  return (
    <>
      <FileUpload
        chooseLabel={t('uploadCsvBtn.label')}
        chooseFileTypes=".csv"
        clearLabel={t('clearBtn.label')}
        clearToolTip={t('clearBtn.toolTip')}
        direction="column"
        maxFileWidth={25}
        //setFile={setFile}
        testId="csvUpload"
        uploadFunction={validateUploadCsv}
      />
      {uploadCsvError && <TimedAlert color={AlertColorTypes.Error} text={uploadCsvError} />}
    </>
  );
}
