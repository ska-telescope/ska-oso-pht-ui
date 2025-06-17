import { useTranslation } from 'react-i18next';
import { Grid, Typography } from '@mui/material';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import AlertDialog from '../alertDialog/AlertDialog';
import FieldWrapper from '../../wrappers/fieldWrapper/FieldWrapper';
import Observation from '../../../utils/types/observation';
import Alert from '../../../components/alerts/standardAlert/StandardAlert';

const LABEL_WIDTH = 6;

interface DeleteObservationConfirmationProps {
  action: Function;
  observation: Observation;
  open: boolean;
  setOpen: Function;
}

export default function DeleteObservationConfirmation({
  action,
  observation,
  open,
  setOpen
}: DeleteObservationConfirmationProps) {
  const { t } = useTranslation('pht');

  const alertContent = (rec: any) => {
    return (
      <Grid p={2} container direction="column" alignItems="center" justifyContent="space-around">
        <FieldWrapper
          label={t('arrayConfiguration.label')}
          labelWidth={LABEL_WIDTH}
          testId="arrayConfiguration"
        >
          <Typography id="arrayConfigurationData" variant="body1">
            {t('arrayConfiguration.' + rec.telescope)}
          </Typography>
        </FieldWrapper>
        <FieldWrapper
          label={t('subArrayConfiguration.short')}
          labelWidth={LABEL_WIDTH}
          testId="subArrayConfiguration"
        >
          <Typography id="subArrayConfigurationData" variant="body1">
            {t('subArrayConfiguration.' + rec.subarray)}
          </Typography>
        </FieldWrapper>
        <FieldWrapper
          label={t('observationType.label')}
          labelWidth={LABEL_WIDTH}
          testId="observationType"
        >
          <Typography id="observationTypeData" variant="body1">
            {t('observationType.' + rec.type)}
          </Typography>
        </FieldWrapper>

        <Alert
          color={AlertColorTypes.Info}
          text={t('deleteObservation.info')}
          testId="deleteObservationInfoId"
        />
      </Grid>
    );
  };

  return (
    <AlertDialog
      open={open}
      onClose={() => setOpen(false)}
      onDialogResponse={action}
      title="deleteObservation.label"
    >
      {alertContent(observation)}
    </AlertDialog>
  );
}
