import { Box, Card, CardContent, CardHeader, Dialog } from '@mui/material';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import CancelButton from '../../../button/Cancel/Cancel';
import SensCalcContent from '../content/SensCalcContent';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import TargetObservation from '@utils/types/targetObservation.tsx';
import { sensitivityStatusLevel } from '@utils/helpersSensCalc';

interface SensCalcDisplaySingleProps {
  open: boolean;
  onClose: Function;
  targetObservation?: TargetObservation;
  isNatural: boolean;
}

const SIZE = 20;

export default function SensCalcModalSingle({
  open,
  onClose,
  targetObservation,
  isNatural
}: SensCalcDisplaySingleProps) {
  const handleClose = () => {
    onClose();
  };

  const results = targetObservation?.sensitivity;
  const level = results ? sensitivityStatusLevel(results.state) : undefined;
  const { t } = useScopedTranslation();

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      id="alert-dialog-proposal-change"
    >
      <Card variant="outlined">
        <CardHeader
          action={<CancelButton action={handleClose} title="closeBtn.label" />}
          avatar={
            <StatusIcon
              ariaTitle={t('sensitivityCalculatorResults.status', {
                status: t('statusLoading.' + level),
                error: ''
              })}
              testId="statusId"
              icon
              level={level}
              size={SIZE}
              text=""
            />
          }
          component={Box}
          title={t('sensitivityCalculatorResults.title')}
          slotProps={{
            title: {
              align: 'center',
              fontWeight: 'bold',
              variant: 'h5'
            }
          }}
        />
      </Card>
      <CardContent>
        <SensCalcContent targetObservation={targetObservation} isNatural={isNatural} />
      </CardContent>
    </Dialog>
  );
}
