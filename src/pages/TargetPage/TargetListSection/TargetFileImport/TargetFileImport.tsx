import React from 'react';
import { Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { FileUpload, FileUploadStatus } from '@ska-telescope/ska-gui-components';
import Papa from 'papaparse';
import { Proposal } from '../../../../utils/types/proposal';
import { RA_TYPE_ICRS, RA_TYPE_GALACTIC, UPLOAD_MAX_WIDTH_CSV } from '../../../../utils/constants';
import Target from '@/utils/types/target';
import { useNotify } from '@/utils/notify/useNotify';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';

const NOTIFICATION_DELAY_IN_SECONDS = 10;

interface TargetFileImportProps {
  raType: number;
}

export default function TargetFileImport({ raType }: TargetFileImportProps) {
  const { t } = useScopedTranslation();
  const { notifyError, notifySuccess } = useNotify();

  const { application, updateAppContent2 } = storageObject.useStore();
  const { setHelp } = useHelp();
  const [uploadButtonStatus, setUploadButtonStatus] = React.useState(null);
  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  React.useEffect(() => {
    setHelp('targetImport.help');
  }, []);

  const AddTheTargetGalactic = (id: string, name: string, latitude: string, longitude: string) => {
    const newTarget = {
      //Default values from AddTarget.tsx
      kind: RA_TYPE_GALACTIC.value,
      id,
      name,
      b: Number(latitude),
      l: Number(longitude),
      redshift: null,
      vel: '',
      velUnit: '0'
    };

    return newTarget;
  };

  const AddTheTargetEquatorial = (id: number, name: string, ra: string, dec: string): Target => {
    const newTarget = {
      kind: RA_TYPE_ICRS.value,
      //Default values from AddTarget.tsx
      decStr: dec,
      id,
      name,
      raStr: ra,
      redshift: '',
      referenceFrame: RA_TYPE_ICRS.label,
      velType: 0,
      vel: '',
      velUnit: 0,
      tiedArrayBeams: {
        pstBeams: [],
        pssBeams: [],
        vlbiBeams: []
      }
    };

    return newTarget;
  };

  const isSameHeader = (header1: any, header2: string[]) => {
    return JSON.stringify(header1) === JSON.stringify(header2);
  };

  const validateUploadCsv = async (theFile: any) => {
    const validEquatorialCsvHeader = ['name', 'ra', 'dec'];
    const validGalacticCsvHeader = ['name', 'longitude', 'latitude'];

    if (theFile) {
      Papa.parse(theFile, {
        header: true,
        skipEmptyLines: true,
        complete: (result: { meta: { fields?: any }; data: any[] }) => {
          setUploadButtonStatus(FileUploadStatus.PENDING);
          try {
            const highestId: number =
              getProposal()?.targets?.reduce(
                (acc, target) => (target.id > acc ? target.id : acc),
                -1
              ) ?? 1;

            let errorInRows = false;
            let targets;

            if (raType === RA_TYPE_ICRS.value) {
              if (!isSameHeader(result.meta.fields, validEquatorialCsvHeader))
                throw t('uploadCsvBtn.uploadErrorEquatorialNotValidMsg');
              targets = result.data.reduce(
                (
                  result: Target[],
                  target: { name: string; ra: string; dec: string },
                  index: number
                ) => {
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
                },
                []
              );
            } else {
              if (!isSameHeader(result.meta.fields, validGalacticCsvHeader))
                throw t('uploadCsvBtn.uploadErrorGalacticNotValidMsg');
              targets = result.data.reduce((result: { //Default values from AddTarget.tsx
                kind: number; id: string; name: string; b: number; l: number; redshift: null; vel: string; velUnit: string }[], target: { name: string; latitude: string; longitude: string }, index: number) => {
                if (target.name && target.latitude && target.longitude) {
                  result.push(
                    AddTheTargetGalactic(
                      index + highestId.toString() + 1,
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
            setProposal({
              ...getProposal(),
              targets: [...(getProposal()?.targets ?? []), ...targets]
            });
            if (errorInRows) throw t('uploadCsvBtn.uploadErrorPartialMsg');
            setUploadButtonStatus(FileUploadStatus.OK);
            notifySuccess(t('uploadCsvBtn.uploadSuccessMsg'), NOTIFICATION_DELAY_IN_SECONDS);
          } catch (e) {
            notifyError(e as string, NOTIFICATION_DELAY_IN_SECONDS);
            setUploadButtonStatus(FileUploadStatus.ERROR);
          }
        },
        error: (message: string) => {
          setUploadButtonStatus(FileUploadStatus.ERROR);
          notifyError(
            t('uploadCsvBtn.uploadErrorUnknownParserMsg') + message,
            NOTIFICATION_DELAY_IN_SECONDS
          );
        }
      });
    }
  };

  return (
    <Grid
      p={1}
      spacing={1}
      container
      direction="row"
      alignItems="flex-start"
      justifyContent="space-around"
    >
      <Grid pt={2} size={{ xs: 11 }}>
        <Typography>{t('importFromFile.descriptionTarget')}</Typography>
      </Grid>
      <Grid size={{ xs: 7 }}>
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
    </Grid>
  );
}
