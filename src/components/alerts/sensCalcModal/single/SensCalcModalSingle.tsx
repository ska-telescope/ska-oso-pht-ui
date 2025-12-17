import { Box, Card, CardContent, CardHeader, Dialog } from '@mui/material';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import CancelButton from '../../../button/Cancel/Cancel';
import { SensCalcResults } from '../../../../utils/types/sensCalcResults';
import SensCalcContent from '../content/SensCalcContent';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface SensCalcDisplaySingleProps {
  open: boolean;
  onClose: Function;
  data: SensCalcResults;
  isCustom: boolean;
  isNatural: boolean;
}

const SIZE = 20;

export default function SensCalcModalSingle({
  open,
  onClose,
  data,
  isCustom,
  isNatural
}: SensCalcDisplaySingleProps) {
  const handleClose = () => {
    onClose();
  };

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
                status: t('statusLoading.' + data.statusGUI),
                error: ''
              })}
              ariaDescription=""
              testId="statusId"
              icon
              level={data.statusGUI}
              size={SIZE}
              text=""
            />
          }
          component={Box}
          title={t('sensitivityCalculatorResults.title')}
          titleTypographyProps={{
            align: 'center',
            fontWeight: 'bold',
            variant: 'h5'
          }}
        />
      </Card>
      <CardContent>
        <SensCalcContent data={data} isCustom={isCustom} isNatural={isNatural} />
      </CardContent>
    </Dialog>
  );
}
