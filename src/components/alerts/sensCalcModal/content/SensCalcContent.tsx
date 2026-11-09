import { Grid, Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { Alert, AlertColorTypes, SPACER_VERTICAL, Spacer } from '@ska-telescope/ska-gui-components';
import { presentUnits, presentValue } from '@utils/present/present';
import {
  CUSTOM_VALID_FIELDS,
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
import { getLowSpectralAveragingFactor } from '@/services/sensitivityCalculator/calculate';
import { SENSITIVITY_FIELDS } from '@/services/sensitivityCalculator/results';
import type { SensitivityValues } from '@/models/proposals/targetObservation';
import {
  convertFrequencyToDisplayUnits,
  getBandwidthZoom,
  getSpectralResolutionHz
} from '@utils/helpers.ts';

interface SensCalcContentProps {
  targetObservation: TargetObservation;
  isNatural?: boolean;
  hideSpectralResults?: boolean;
}

const GAP = 4;
const SPACER_HEIGHT = 30;

export default function SensCalcContent({
  targetObservation,
  isNatural = false,
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

  const dataProduct = proposal.dataProductSDP?.find(
    (dataProduct) => dataProduct.id === targetObservation.dataProductsSDPId
  );

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

  const displayElement = (
    elementId: string,
    elementValue?: string | number,
    elementUnits?: string
  ) => {
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
            {elementId === 'targetName'
              ? elementValue
              : observation?.subarray === SA_CUSTOM || isNatural
                ? PresentCustomResultValue(elementValue, elementId)
                : presentValue(elementValue)}{' '}
            {!elementUnits || observation?.subarray === SA_CUSTOM || isNatural
              ? ''
              : presentUnits(elementUnits)}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  if (targetObservation.sensitivity?.state === SENSITIVITY_STATE.FAILED) {
    return (
      <Alert testId="alertSensCalResultsId" color={AlertColorTypes.Error}>
        <Typography
          sx={{
            p: GAP
          }}
        >
          {targetObservation.sensitivity?.error}
        </Typography>
      </Alert>
    );
  }

  const sensitivity = targetObservation.sensitivity;
  if (sensitivity == undefined) {
    return (
      <Alert>
        <Typography
          sx={{
            p: GAP
          }}
        >
          {t('sensitivityCalculatorResults.noData')}
        </Typography>
      </Alert>
    );
  }

  // The continuum or spectral results, each labelled by its part, e.g. continuumSensitivityWeighted
  const resultsPart = (part: 'continuum' | 'spectral', values: SensitivityValues) => (
    <>
      <Spacer size={SPACER_HEIGHT} axis={SPACER_VERTICAL} />
      {SENSITIVITY_FIELDS.map(({ key, label }) =>
        displayElement(`${part}${label}`, values[key].value, values[key].unit)
      )}
    </>
  );

  const spectralResolution = observation
    ? convertFrequencyToDisplayUnits(
        [TYPE_CONTINUUM, TYPE_CONTINUUM_SPECTRAL, TYPE_CONTINUUM_SPECTRAL_LONG].includes(
          observation?.type
        )
          ? getLowSpectralAveragingFactor(observation, dataProduct) *
              LOW_CONTINUUM_SPECTRAL_RESOLUTION_KHZ
          : getSpectralResolutionHz(observation) * 1e-3,
        FREQUENCY_STR_KHZ
      )
    : undefined;
  const bandwidth = [
    TYPE_CONTINUUM,
    TYPE_CONTINUUM_SPECTRAL,
    TYPE_CONTINUUM_SPECTRAL_LONG
  ].includes(observation?.type)
    ? {
        value: observation?.continuumBandwidth,
        unit: FREQUENCY_UNITS[observation?.continuumBandwidthUnits - 1]?.label
      }
    : getBandwidthZoom(observation);

  return (
    <>
      {displayElement('targetName', target?.name)}
      {displayElement(
        'centralFrequency',
        observation?.centralFrequency,
        FREQUENCY_UNITS[observation?.centralFrequencyUnits - 1]?.label
      )}
      {displayElement('bandwidth', bandwidth.value, bandwidth.unit)}
      {displayElement('spectralResolution', spectralResolution?.value, spectralResolution?.unit)}
      {displayElement('integrationTime', observation?.supplied.value, 'h')}

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
