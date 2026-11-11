import { Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { Alert, AlertColorTypes, BorderedSection } from '@ska-telescope/ska-gui-components';
import { useTheme } from '@mui/material/styles';
import { ProposalType } from '@/models/proposals/proposal';
import {
  DATA_PRODUCT_KIND,
  DataProductKind,
  isImageDataProduct,
  newDataProduct,
  STEPPED_FIELD,
  steppedFromPdm,
  updateImageSizes
} from '@/models/proposals/dataProducts';
import {
  CHANNELS_OUT_MIN_CONTINUUM,
  FREQUENCY_MHZ,
  REFERENCE_COORDINATE_TYPE_SSO,
  SENSITIVITY_STATE,
  TYPE_CONTINUUM,
  TYPE_PST
} from '@/utils/constants';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import Observation from '@/utils/types/observation';
import { frequencyConversion } from '@/utils/helpers';
import SensCalcContent from '@/components/alerts/sensCalcModal/content/SensCalcContent';
import TargetObservation from '@/utils/types/targetObservation';
import Target from '@/utils/types/target';
import { isNonGaussianBeamWeighting } from '@/utils/helpersSensCalc';
import DataProductView, { legacyWeighting } from './DataProductView';

const GAP = 5;

const centralFrequencyMhz = (observation: Observation) =>
  frequencyConversion(
    observation.centralFrequency,
    observation.centralFrequencyUnits ?? FREQUENCY_MHZ,
    FREQUENCY_MHZ
  );

/**
 * An SV proposal's one observation and its data products, edited in place in the proposal form.
 * The data product shown is the one the link points at, or before there is a link the
 * observation's main one, which comes first. The others are hidden companions.
 */
export default function DataProductInPlace({ observation }: { observation: Observation }) {
  const { t } = useScopedTranslation();
  const theme = useTheme();
  const form = useFormContext<ProposalType>();
  const dataProducts = useWatch({ control: form.control, name: 'dataProducts' });
  const links = useWatch({
    control: form.control,
    name: 'targetObservation'
  }) as TargetObservation[];
  const targets = useWatch({ control: form.control, name: 'targets' }) as Target[];

  const link = links.find((rec) => rec.observationId === observation.id);
  const linkedIndex = dataProducts.findIndex((dp) => dp.id === link?.dataProductsSDPId);
  const dpIndex =
    linkedIndex >= 0
      ? linkedIndex
      : dataProducts.findIndex((dp) => dp.observationId === observation.id);
  const dp = dataProducts[dpIndex];

  // Switching between images and visibilities makes the other one the main data product. The one
  // switched from becomes the hidden companion again, so it gets its defaults back.
  const switchContinuumKind = (kind: DataProductKind) => {
    const next = dataProducts.find(
      (other) => other.observationId === observation.id && other.kind === kind
    );
    if (!dp || !next || next.id === dp.id) {
      return;
    }
    const companion =
      dp.kind === DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES
        ? {
            ...dp,
            timeAveragingS: steppedFromPdm(4, STEPPED_FIELD.TIME_AVERAGING_S),
            frequencyAveragingKhz: steppedFromPdm(4, STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ)
          }
        : {
            ...updateImageSizes(
              newDataProduct(DATA_PRODUCT_KIND.CONTINUUM_IMAGE, observation.id) as Parameters<
                typeof updateImageSizes
              >[0],
              centralFrequencyMhz(observation)
            ),
            id: dp.id
          };
    const others = dataProducts.filter(
      (other) => other.observationId !== observation.id || ![dp.id, next.id].includes(other.id)
    );
    form.setValue('dataProducts', [next, companion, ...others]);
    form.setValue(
      'targetObservation',
      links.map((rec) =>
        rec.observationId === observation.id
          ? {
              ...rec,
              dataProductsSDPId: next.id,
              // The results were for the other data product; the sensitivity service calculates them
              sensitivity: { state: SENSITIVITY_STATE.CALCULATING }
            }
          : rec
      )
    );
  };

  if (!dp) {
    return null;
  }

  // Why the sensitivity calculator doesn't apply to this data product, or undefined when it does.
  // PST is checked first: the observing mode alone rules the calculator out, target or not.
  const sensCalcUnavailable = ():
    { message: string; color: AlertColorTypes.Warning | AlertColorTypes.Error } | undefined => {
    if (observation.type === TYPE_PST) {
      return { message: t('page.7.pstUnavailable'), color: AlertColorTypes.Warning };
    }
    if (!link) {
      return { message: t('sensitivityCalculatorResults.noTarget'), color: AlertColorTypes.Error };
    }
    const target = targets.find((tgt) => tgt.id === link.targetId);
    if (target?.kind === REFERENCE_COORDINATE_TYPE_SSO.value) {
      return {
        message: t('sensitivityCalculatorResults.notApplicableForSSO'),
        color: AlertColorTypes.Warning
      };
    }
    return undefined;
  };
  const scUnavailable = sensCalcUnavailable();

  const sensitivityBorder = () => {
    if (scUnavailable) {
      return scUnavailable.color === AlertColorTypes.Error
        ? theme.palette.error.main
        : theme.palette.warning.main;
    }
    switch (link?.sensitivity?.state) {
      case undefined:
        return theme.palette.warning.main;
      case SENSITIVITY_STATE.CALCULATING:
        return theme.palette.info.main;
      case SENSITIVITY_STATE.FAILED:
        return theme.palette.error.main;
      default:
        return theme.palette.success.main;
    }
  };

  const isNatural =
    isImageDataProduct(dp) && isNonGaussianBeamWeighting(legacyWeighting(dp.weighting), dp.robust);
  const hideSpectralResults =
    dp.kind === DATA_PRODUCT_KIND.CONTINUUM_IMAGE && dp.channelsOut === CHANNELS_OUT_MIN_CONTINUUM;

  const sensitivityPanel = (
    <BorderedSection
      borderColor={sensitivityBorder()}
      title={
        observation.type === TYPE_CONTINUUM
          ? `${t('sensitivityCalculatorResults.title')} (Imaging ODP)`
          : t('sensitivityCalculatorResults.title')
      }
    >
      {scUnavailable ? (
        <Alert testId="alertSensCalResultsId" color={scUnavailable.color}>
          <Typography sx={{ p: GAP }}>{scUnavailable.message}</Typography>
        </Alert>
      ) : (
        <SensCalcContent
          targetObservation={link as TargetObservation}
          isNatural={isNatural}
          hideSpectralResults={hideSpectralResults}
        />
      )}
    </BorderedSection>
  );

  return (
    <DataProductView
      index={dpIndex}
      observation={observation}
      observations={[observation]}
      onContinuumKindChange={switchContinuumKind}
      sensitivityPanel={sensitivityPanel}
    />
  );
}
