import sensCalHelpers from './sensCalHelpers';
import Observation from 'utils/types/observation';
import { SensCalcResult } from './getSensitivityCalculatorAPIData';
import { OBS_TYPES, STATUS_OK, TELESCOPE_LOW_NUM, TYPE_CONTINUUM } from '../../../utils/constants';
import {
  SensitivityCalculatorAPIResponseLow,
  SensitivityCalculatorAPIResponseMid
} from './../../../utils/types/sensitivityCalculatorAPIResponse';
import Target from 'utils/types/target';

export default function calculateSensitivityCalculatorResults(
  // response: SensitivityCalculatorAPIResponseLow | SensitivityCalculatorAPIResponseMid,
  response: any,
  observation: Observation,
  target: Target
): SensCalcResult {
  const isLOW = () => observation.telescope === TELESCOPE_LOW_NUM;

  const weightedSensitivity = isLOW()
    ? getWeightedSensitivityLOW(response)
    : getWeightedSensitivityMID(response);
  const confusionNoise = isLOW() ? getConfusionNoiseLOW(response) : getConfusionNoiseMID(response);
  const totalSensitivity = getSensitivity(confusionNoise, weightedSensitivity);
  const beamSize = isLOW() ? getBeamSizeLOW(response) : getBeamSizeMID(response);
  const sbs = isLOW()
    ? getSBSLOW(response, totalSensitivity)
    : getSBSMID(response, totalSensitivity);

  const spectralWeightedSensitivity = isLOW()
    ? getSpectralWeightedSensitivityLOW(response)
    : getSpectralWeightedSensitivityMID(response);
  const spectralConfusionNoise = isLOW()
    ? getSpectralConfusionNoiseLOW(response)
    : getSpectralConfusionNoiseMID(response);
  const spectralTotalSensitivity = getSensitivity(
    spectralConfusionNoise,
    spectralWeightedSensitivity
  );
  const spectralBeamSize = isLOW()
    ? getSpectralBeamSizeLOW(response)
    : getSpectralBeamSizeMID(response);
  const spectralSbs = isLOW()
    ? getSpectralSBSLOW(response, spectralTotalSensitivity)
    : getSpectralSBSMID(response, spectralTotalSensitivity);

  const confusionNoiseDisplay = sensCalHelpers.format.convertSensitivityToDisplayValue(
    confusionNoise
  );
  const weightedSensitivityDisplay = sensCalHelpers.format.convertSensitivityToDisplayValue(
    weightedSensitivity
  );
  const totalSensitivityDisplay = sensCalHelpers.format.convertSensitivityToDisplayValue(
    totalSensitivity
  );
  const beamSizeDisplay = { value: beamSize, units: 'arcsecs2' };
  const sbsDisplay = { value: sbs, units: 'k' };

  const spectralConfusionNoiseDisplay =
    observation.type === TYPE_CONTINUUM
      ? sensCalHelpers.format.convertSensitivityToDisplayValue(spectralConfusionNoise)
      : { value: '', units: '' };
  const spectralWeightedSensitivityDisplay = sensCalHelpers.format.convertSensitivityToDisplayValue(
    spectralWeightedSensitivity
  );
  const spectralTotalSensitivityDisplay = sensCalHelpers.format.convertSensitivityToDisplayValue(
    spectralTotalSensitivity
  );
  const spectralBeamSizeDisplay = { value: spectralBeamSize, units: 'arcsecs2' };
  const spectralSbsDisplay = { value: spectralSbs, units: 'k' };

  const observationTypeLabel: string = OBS_TYPES[observation.type];

  return {
    title: target.name,
    status: STATUS_OK,
    section1: [
      {
        field: `${observationTypeLabel}SensitivityWeighted`,
        value: weightedSensitivityDisplay?.value,
        units: weightedSensitivityDisplay?.units
      },
      {
        field: `${observationTypeLabel}ConfusionNoise`,
        value: confusionNoiseDisplay?.value,
        units: confusionNoiseDisplay?.units
      },
      {
        field: `${observationTypeLabel}TotalSensitivity`,
        value: totalSensitivityDisplay?.value,
        units: totalSensitivityDisplay?.units
      },
      {
        field: `${observationTypeLabel}SynthBeamSize`,
        value: beamSizeDisplay?.value,
        units: beamSizeDisplay?.units
      },
      {
        field: `${observationTypeLabel}SurfaceBrightnessSensitivity`,
        value: sbsDisplay?.value,
        units: sbsDisplay?.units
      }
    ],
    // only return section2 if continuum
    ...(observation.type === TYPE_CONTINUUM && {
      section2: [
        {
          field: 'spectralSensitivityWeighted',
          value: spectralWeightedSensitivityDisplay.value,
          units: spectralWeightedSensitivityDisplay.units
        },
        {
          field: 'spectralConfusionNoise',
          value: spectralConfusionNoiseDisplay?.value,
          units: spectralConfusionNoiseDisplay?.units
        },
        {
          field: 'spectralTotalSensitivity',
          value: spectralTotalSensitivityDisplay.value,
          units: spectralTotalSensitivityDisplay.units
        },
        {
          field: 'spectralSynthBeamSize',
          value: spectralBeamSizeDisplay?.value,
          units: spectralBeamSizeDisplay?.units
        },
        {
          field: 'spectralSurfaceBrightnessSensitivity',
          value: spectralSbsDisplay?.value,
          units: spectralSbsDisplay?.units
        }
      ]
    }),
    section3: [
      {
        field: 'integrationTime',
        value: observation.integration_time,
        units: sensCalHelpers.format.getIntegrationTimeUnitsLabel(
          observation.integration_time_units
        )
      }
    ]
  } as SensCalcResult;
}

/******************************************* MID ********************************************/

const getConfusionNoiseLOW = (response: SensitivityCalculatorAPIResponseLow) =>
  response.weighting.confusion_noise.value[0];

const getWeightedSensitivityLOW = (response: SensitivityCalculatorAPIResponseLow) =>
  (response.calculate.continuum_sensitivity.value ?? 0) * response.weighting.weighting_factor;

const getBeamSizeLOW = (response: SensitivityCalculatorAPIResponseLow) =>
  sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
    response.weighting.beam_size[0].beam_maj_scaled,
    response.weighting.beam_size[0].beam_min_scaled,
    1
  );

const getSBSLOW = (response: SensitivityCalculatorAPIResponseLow, sense: number) =>
  sense * response.weighting.sbs_conv_factor[0];

/* -------------- */

const getSpectralConfusionNoiseLOW = (response: SensitivityCalculatorAPIResponseLow) =>
  response.weightingLine.confusion_noise.value[0];

const getSpectralWeightedSensitivityLOW = (response: SensitivityCalculatorAPIResponseLow) =>
  (response.calculate.spectral_sensitivity.value ?? 0) * response.weightingLine.weighting_factor;

const getSpectralBeamSizeLOW = (response: SensitivityCalculatorAPIResponseLow) =>
  sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
    response.weightingLine.beam_size[0].beam_maj_scaled,
    response.weightingLine.beam_size[0].beam_min_scaled,
    1
  );

const getSpectralSBSLOW = (response: SensitivityCalculatorAPIResponseLow, sense: number) =>
  sense * response.weightingLine.sbs_conv_factor[0];

/******************************************* MID ********************************************/

const getConfusionNoiseMID = (response: SensitivityCalculatorAPIResponseMid) =>
  response.weighting.data.confusion_noise.value[0];

const getWeightedSensitivityMID = (response: SensitivityCalculatorAPIResponseMid) =>
  (response.calculate?.data?.result?.sensitivity ?? 0) * response.weighting?.data?.weighting_factor;

const getBeamSizeMID = (response: SensitivityCalculatorAPIResponseLow) =>
  sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
    response.weighting.beam_size[0].beam_maj_scaled,
    response.weighting.beam_size[0].beam_min_scaled,
    1
  );

const getSBSMID = (response: SensitivityCalculatorAPIResponseLow, sense: number) =>
  sense * response.weighting.sbs_conv_factor[0];

/* -------------- */

const getSpectralConfusionNoiseMID = (response: SensitivityCalculatorAPIResponseMid) =>
  response.weightingLine.data.confusion_noise.value[0];

const getSpectralWeightedSensitivityMID = (response: SensitivityCalculatorAPIResponseMid) =>
  (response.calculate.data?.result?.sensitivity ?? 0) *
  response.weightingLine.data.weighting_factor;

const getSpectralBeamSizeMID = (response: SensitivityCalculatorAPIResponseLow) =>
  sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
    response.weightingLine.beam_size[0].beam_maj_scaled,
    response.weightingLine.beam_size[0].beam_min_scaled,
    1
  );

const getSpectralSBSMID = (response: SensitivityCalculatorAPIResponseLow, sense: number) =>
  sense * response.weightingLine.sbs_conv_factor[0];

/********************************************************************************************/

const getSensitivity = (confusionNoise: number, weightedSensitivity: number) =>
  sensCalHelpers.calculate.sqrtOfSumSqs(confusionNoise * 1e6, weightedSensitivity);
