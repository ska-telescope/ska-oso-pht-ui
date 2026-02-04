import { Grid, Typography } from '@mui/material';
import { Alert, AlertColorTypes, SPACER_VERTICAL, Spacer } from '@ska-telescope/ska-gui-components';
import { presentUnits, presentValue } from '@utils/present/present';
import { CUSTOM_VALID_FIELDS, STATUS_INITIAL } from '../../../../utils/constants';
import { SensCalcResults } from '../../../../utils/types/sensCalcResults';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface SensCalcContentProps {
  data: SensCalcResults;
  isCustom?: boolean;
  isNatural?: boolean;
}

const GAP = 4;
const SPACER_HEIGHT = 30;

export default function SensCalcModalSingle({
  data,
  isCustom = false,
  isNatural = false
}: SensCalcContentProps) {
  const { t } = useScopedTranslation();

  const PresentCustomResultValue = (eValue: any, eId: string) => {
    if (eId === 'targetName') {
      return eValue;
    }
    if (!CUSTOM_VALID_FIELDS.includes(eId)) {
      if (isNatural) {
        return t('sensitivityCalculatorResults.nonGaussian');
      }
      return t('sensitivityCalculatorResults.customArray');
    }
    return `${presentValue(eValue)}`;
  };

  const displayElement = (eLabel: string, eValue: any, eUnits: string, eId: string) => {
    return (
      <Grid key={eId} container direction="row" justifyContent="center" alignItems="center">
        <Grid size={{ xs: 6 }}>
          <Typography id={eId} sx={{ align: 'right', fontWeight: 'normal' }} variant="body1">
            {eLabel}
          </Typography>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Typography
            id={eId + 'Label'}
            data-testid={`field-${eId}`}
            sx={{ align: 'left', fontWeight: 'bold' }}
            variant="body1"
          >
            {eId === 'targetName' || isCustom || isNatural
              ? PresentCustomResultValue(eValue, eId)
              : presentValue(eValue)}{' '}
            {eId === 'targetName' || isCustom || isNatural ? '' : presentUnits(eUnits)}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  return (
    <>
      {data?.statusGUI !== STATUS_INITIAL && data?.title !== '*SHOW PST MESSAGE*' ? (
        <>
          {displayElement(
            t('sensitivityCalculatorResults.targetName'),
            data.title,
            '',
            'targetName'
          )}
          {data?.section1 && <Spacer size={SPACER_HEIGHT} axis={SPACER_VERTICAL} />}
          {data?.section1?.map(rec =>
            displayElement(
              t('sensitivityCalculatorResults.' + rec.field),
              rec.value,
              rec.units ?? '',
              rec.field
            )
          )}
          {data?.section2 && <Spacer size={SPACER_HEIGHT} axis={SPACER_VERTICAL} />}
          {data?.section2?.map(rec =>
            displayElement(
              t('sensitivityCalculatorResults.' + rec.field),
              rec.value,
              rec.units ?? '',
              rec.field
            )
          )}
          {data?.section3 && <Spacer size={SPACER_HEIGHT} axis={SPACER_VERTICAL} />}
          {data?.section3?.map(rec =>
            displayElement(
              t('sensitivityCalculatorResults.' + rec.field),
              rec.value,
              rec.units ?? '',
              rec.field
            )
          )}
        </>
      ) : data?.statusGUI !== STATUS_INITIAL && data?.title === '*SHOW PST MESSAGE*' ? (
        <Alert testId="alertSensCalResultsId" color={AlertColorTypes.Warning}>
          <Typography p={GAP}>{t('page.7.pstUnavailable')}</Typography>
        </Alert>
      ) : (
        <Alert testId="alertSensCalResultsId" color={AlertColorTypes.Error}>
          <Typography p={GAP}>{t('sensitivityCalculatorResults.noData')}</Typography>
        </Alert>
      )}
    </>
  );
}
