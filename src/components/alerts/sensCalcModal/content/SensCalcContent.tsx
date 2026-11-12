import { Grid, Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { Alert, AlertColorTypes, SPACER_VERTICAL, Spacer } from '@ska-telescope/ska-gui-components';
import { presentUnits, presentValue } from '@utils/present/present';
import {
  FREQUENCY_STR_KHZ,
  FREQUENCY_UNITS,
  LOW_CONTINUUM_SPECTRAL_RESOLUTION_KHZ,
  SA_CUSTOM,
  SENSITIVITY_STATE,
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL,
  TYPE_CONTINUUM_SPECTRAL_LONG
} from '../../../../utils/constants';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import TargetObservation from '@utils/types/targetObservation.tsx';
import { storageObject } from '@utils/storage/store';
import Proposal from '@utils/types/proposal.tsx';
import Target from '@utils/types/target';
import type { ProposalType } from '@/models/proposals/proposal';
import {
  getLowSpectralAveragingFactor,
  getSensitivityDataProduct
} from '@/services/sensitivityCalculator/calculate';
import { SENSITIVITY_FIELDS } from '@/services/sensitivityCalculator/results';
import type { SensitivityValues } from '@/models/proposals/targetObservation';
import {
  convertFrequencyToDisplayUnits,
  getBandwidthZoom,
  getSpectralResolutionHz
} from '@utils/helpers.ts';

interface SensCalcContentProps {
  targetObservation: TargetObservation;
  hideSpectralResults?: boolean;
}

const GAP = 4;
const SPACER_HEIGHT = 30;

export default function SensCalcContent({
  targetObservation,
  hideSpectralResults = false
}: SensCalcContentProps) {
  const { t } = useScopedTranslation();

  const { application } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;

  const proposal = getProposal();

  // TODO: The form owns the targets; observations and data products are still read from the store
  const form = useFormContext<ProposalType>();
  const targets = (useWatch({ control: form.control, name: 'targets' }) ?? []) as Target[];
  const target = targets.find((target) => target.id === targetObservation.targetId);

  const observation = proposal.observations?.find(
    (observation) => observation.id === targetObservation.observationId
  );

  // The data product the results were calculated from, which can differ from the linked one
  const dataProduct =
    observation &&
    getSensitivityDataProduct(
      observation,
      targetObservation.dataProductsSDPId,
      proposal.dataProductSDP ?? []
    );

  // Shown for a result the calculator didn't give: the ones that depend on the synthesized beam,
  // which a custom subarray or a non-Gaussian beam has none of
  const notAvailable = t(
    observation?.subarray === SA_CUSTOM
      ? 'sensitivityCalculatorResults.customArray'
      : 'sensitivityCalculatorResults.nonGaussian'
  );

  // A value with its units, as shown
  const valueText = (value?: string | number | null, units?: string) =>
    value == null ? '' : `${presentValue(value)} ${units ? presentUnits(units) : ''}`;

  const displayElement = (elementId: string, text?: string) => {
    return (
      <Grid
        key={elementId}
        container
        direction="row"
        sx={{
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Grid size={{ xs: 6 }}>
          <Typography id={elementId} sx={{ align: 'right', fontWeight: 'normal' }} variant="body1">
            {t(`sensitivityCalculatorResults.${elementId}`)}
          </Typography>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Typography
            id={`${elementId}-label`}
            aria-labelledby={elementId}
            data-testid={`field-${elementId}`}
            sx={{ align: 'left', fontWeight: 'bold' }}
            variant="body1"
          >
            {text}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  const resultsAlert = (message?: string, color?: typeof AlertColorTypes.Error) => (
    <Alert testId="alertSensCalResultsId" color={color}>
      <Typography sx={{ p: GAP }}>{message}</Typography>
    </Alert>
  );

  if (!observation || !dataProduct) {
    return resultsAlert(
      t('sensitivityCalculatorResults.noObservationOrDataProduct'),
      AlertColorTypes.Error
    );
  }
  const sensitivity = targetObservation.sensitivity;
  if (sensitivity?.state === SENSITIVITY_STATE.FAILED) {
    return resultsAlert(sensitivity.error, AlertColorTypes.Error);
  }
  if (sensitivity == undefined) {
    return resultsAlert(t('sensitivityCalculatorResults.noData'));
  }

  // The continuum or spectral results, each labelled by its part, e.g. continuumSensitivityWeighted
  const resultsPart = (part: 'continuum' | 'spectral', values: SensitivityValues) => (
    <>
      <Spacer size={SPACER_HEIGHT} axis={SPACER_VERTICAL} />
      {SENSITIVITY_FIELDS.map(({ key, label }) =>
        values[key]
          ? displayElement(`${part}${label}`, valueText(values[key].value, values[key].unit))
          : displayElement(`${part}${label}`, notAvailable)
      )}
    </>
  );

  const spectralResolution = convertFrequencyToDisplayUnits(
    [TYPE_CONTINUUM, TYPE_CONTINUUM_SPECTRAL, TYPE_CONTINUUM_SPECTRAL_LONG].includes(
      observation.type
    )
      ? getLowSpectralAveragingFactor(observation, dataProduct) *
          LOW_CONTINUUM_SPECTRAL_RESOLUTION_KHZ
      : getSpectralResolutionHz(observation) * 1e-3,
    FREQUENCY_STR_KHZ
  );
  const bandwidth = [
    TYPE_CONTINUUM,
    TYPE_CONTINUUM_SPECTRAL,
    TYPE_CONTINUUM_SPECTRAL_LONG
  ].includes(observation.type)
    ? {
        value: observation.continuumBandwidth,
        unit: FREQUENCY_UNITS[observation.continuumBandwidthUnits - 1]?.label
      }
    : getBandwidthZoom(observation);

  return (
    <>
      {displayElement('targetName', target?.name)}
      {displayElement(
        'centralFrequency',
        valueText(
          observation.centralFrequency,
          FREQUENCY_UNITS[observation.centralFrequencyUnits - 1]?.label
        )
      )}
      {displayElement('bandwidth', valueText(bandwidth.value, bandwidth.unit))}
      {displayElement(
        'spectralResolution',
        valueText(spectralResolution?.value, spectralResolution?.unit)
      )}
      {displayElement('integrationTime', valueText(observation.supplied.value, 'h'))}

      {sensitivity.state === SENSITIVITY_STATE.CALCULATING && (
        <>
          <Spacer size={SPACER_HEIGHT} axis={SPACER_VERTICAL} />
          <Typography
            data-testid="sensCalcCalculating"
            sx={{ textAlign: 'center' }}
            variant="body1"
          >
            {t('sensitivityCalculatorResults.calculating')}
          </Typography>
        </>
      )}

      {sensitivity.state === SENSITIVITY_STATE.DONE && (
        <>
          {sensitivity.continuum && resultsPart('continuum', sensitivity.continuum)}
          {/* A continuum observation's spectral results can be hidden; zoom ones are its only results */}
          {!(hideSpectralResults && sensitivity.continuum) &&
            resultsPart('spectral', sensitivity.spectral)}
        </>
      )}
    </>
  );
}
