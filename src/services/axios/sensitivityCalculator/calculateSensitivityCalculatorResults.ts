import sensCalHelpers from './sensCalHelpers';
import Observation from '../../../utils/types/observation';
import { SensCalcResults } from '../../../utils/types/sensCalcResults';
import {
  OBS_TYPES,
  STATUS_OK,
  TELESCOPE_LOW_NUM,
  TYPE_CONTINUUM,
  TYPE_ZOOM
} from '../../../utils/constants';
import {
  SensitivityCalculatorAPIResponseLow,
  SensitivityCalculatorAPIResponseMid
} from './../../../utils/types/sensitivityCalculatorAPIResponse';
import Target from '../../../utils/types/target';

export default function calculateSensitivityCalculatorResults(
  response: any,
  observation: Observation,
  target: Target
): SensCalcResults {
  const isLOW = () => observation.telescope === TELESCOPE_LOW_NUM;
  const weightedSensitivity = isLOW()
    ? getWeightedSensitivityLOW(response, observation.type)
    : getWeightedSensitivityMID(response);
  const confusionNoise: number = isLOW()
    ? getConfusionNoiseLOW(response)
    : getConfusionNoiseMID(response);
  const totalSensitivity = getSensitivity(confusionNoise, weightedSensitivity);
  const beamSize = isLOW() ? getBeamSizeLOW(response) : getBeamSizeMID(response);
  const sbs = isLOW()
    ? getSBSLOW(response, totalSensitivity)
    : getSBSMID(response, totalSensitivity);
  const spectralWeightedSensitivity = isLOW()
    ? getSpectralWeightedSensitivityLOW(response, observation.type)
    : getSpectralWeightedSensitivityMID(response, observation.type);
  const spectralConfusionNoise = isLOW()
    ? getSpectralConfusionNoiseLOW(response, observation.type)
    : getSpectralConfusionNoiseMID(response, observation.type);
  const spectralTotalSensitivity = getSensitivity(
    spectralConfusionNoise,
    spectralWeightedSensitivity
  );
  const spectralBeamSize = isLOW()
    ? getSpectralBeamSizeLOW(response, observation.type)
    : getSpectralBeamSizeMID(response, observation.type);
  const spectralSbs = isLOW()
    ? getSpectralSBSLOW(response, spectralTotalSensitivity, observation.type)
    : getSpectralSBSMID(response, spectralTotalSensitivity, observation.type);
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
      : { value: '', unit: '' };
  const spectralWeightedSensitivityDisplay = sensCalHelpers.format.convertSensitivityToDisplayValue(
    spectralWeightedSensitivity
  );
  const spectralTotalSensitivityDisplay = sensCalHelpers.format.convertSensitivityToDisplayValue(
    spectralTotalSensitivity
  );
  const spectralBeamSizeDisplay = { value: spectralBeamSize, units: 'arcsecs2' };
  const spectralSbsDisplay = { value: spectralSbs, units: 'k' };

  const observationTypeLabel: string = OBS_TYPES[observation.type];

  const theResults = {
    id: target.name,
    title: target.name,
    status: STATUS_OK,
    section1: [
      {
        field: `${observationTypeLabel}SensitivityWeighted`,
        value: weightedSensitivityDisplay?.value,
        units: weightedSensitivityDisplay?.unit
      },
      {
        field: `${observationTypeLabel}ConfusionNoise`,
        value: confusionNoiseDisplay?.value,
        units: confusionNoiseDisplay?.unit
      },
      {
        field: `${observationTypeLabel}TotalSensitivity`,
        value: totalSensitivityDisplay?.value,
        units: totalSensitivityDisplay?.unit
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
          units: spectralWeightedSensitivityDisplay.unit
        },
        {
          field: 'spectralConfusionNoise',
          value: spectralConfusionNoiseDisplay?.value,
          units: spectralConfusionNoiseDisplay?.unit
        },
        {
          field: 'spectralTotalSensitivity',
          value: spectralTotalSensitivityDisplay.value,
          units: spectralTotalSensitivityDisplay.unit
        },
        {
          field: 'spectralSynthBeamSize',
          value: spectralBeamSizeDisplay?.value,
          units: spectralBeamSizeDisplay?.units
        },
        {
          field: 'spectralSurfaceBrightnessSensitivity',
          value: spectralSbsDisplay?.value.toString(),
          units: spectralSbsDisplay?.units
        }
      ]
    }),
    section3: [
      {
        field: 'integrationTime',
        value: observation.integrationTime.toString(),
        units: sensCalHelpers.format.getIntegrationTimeUnitsLabel(observation.integrationTimeUnits)
      }
    ]
  };
  return theResults as SensCalcResults;
}

/******************************************* MID ********************************************/

const getConfusionNoiseLOW = (response: SensitivityCalculatorAPIResponseLow): number =>
  response.weighting.confusion_noise.value
    ? Number(response.weighting.confusion_noise.value[0])
    : 0;

const getWeightedSensitivityLOW = (response: SensitivityCalculatorAPIResponseLow, type: number) => {
  const sensitivity =
    type === TYPE_ZOOM
      ? response.calculate.data.spectral_sensitivity?.value
      : response.calculate.data.continuum_sensitivity?.value;
  return (sensitivity ?? 0) * response.weighting.weighting_factor;
};

const getBeamSizeLOW = (response: SensitivityCalculatorAPIResponseLow) =>
  sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
    response.weighting.beam_size[0].beam_maj_scaled,
    response.weighting.beam_size[0].beam_min_scaled,
    1
  );

const getSBSLOW = (response: SensitivityCalculatorAPIResponseLow, sense: number) =>
  sense * response.weighting.sbs_conv_factor[0];

/* -------------- */

const getSpectralConfusionNoiseLOW = (
  response: SensitivityCalculatorAPIResponseLow,
  type: number
) => {
  const spectralConfusionNoise =
    type === TYPE_ZOOM
      ? response.weighting.confusion_noise.value[0]
      : response.weightingLine.confusion_noise.value[0];
  return spectralConfusionNoise;
};

const getSpectralWeightedSensitivityLOW = (
  response: SensitivityCalculatorAPIResponseLow,
  type: number
) => {
  const weighting_factor =
    type === TYPE_ZOOM
      ? response.weighting.weighting_factor
      : response.weightingLine.weighting_factor;
  return (response.calculate.data.spectral_sensitivity?.value ?? 0) * weighting_factor;
};

const getSpectralBeamSizeLOW = (response: SensitivityCalculatorAPIResponseLow, type: number) => {
  const beams =
    type === TYPE_ZOOM ? response.weighting.beam_size : response.weightingLine.beam_size;
  sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
    beams[0].beam_maj_scaled,
    beams[0].beam_min_scaled,
    1
  );
};

const getSpectralSBSLOW = (
  response: SensitivityCalculatorAPIResponseLow,
  sense: number,
  type: number
) => {
  const conv_factor =
    type === TYPE_ZOOM
      ? response?.weighting?.sbs_conv_factor[0]
      : response?.weightingLine?.sbs_conv_factor[0];
  return sense * conv_factor;
};

/******************************************* MID ********************************************/

const getConfusionNoiseMID = (response: SensitivityCalculatorAPIResponseMid): number =>
  response.weighting.data.confusion_noise.value
    ? Number(response.weighting.data.confusion_noise.value[0])
    : 0;

const getWeightedSensitivityMID = (
  response: SensitivityCalculatorAPIResponseMid // TO DO
) =>
  (response.calculate?.data?.data?.result.sensitivity ?? 0) *
  response.weighting?.data?.weighting_factor;

const getBeamSizeMID = (response: SensitivityCalculatorAPIResponseMid) =>
  sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
    response.weighting.data.beam_size[0].beam_maj_scaled,
    response.weighting.data.beam_size[0].beam_min_scaled,
    1
  );

const getSBSMID = (response: SensitivityCalculatorAPIResponseMid, sense: number) =>
  sense * response.weighting.data.sbs_conv_factor[0];

/* -------------- */

const getSpectralConfusionNoiseMID = (
  response: SensitivityCalculatorAPIResponseMid,
  type: number
) => {
  const spectralConfusionNoise =
    type === TYPE_ZOOM
      ? response.weighting.data.confusion_noise.value[0]
      : response.weightingLine.data.confusion_noise.value[0];
  return spectralConfusionNoise;
};

const getSpectralWeightedSensitivityMID = (
  response: SensitivityCalculatorAPIResponseMid,
  type: number
) => {
  const weighting_factor =
    type === TYPE_ZOOM
      ? response.weighting?.data.weighting_factor
      : response.weightingLine?.data.weighting_factor;
  return (response.calculate.data?.data?.result?.sensitivity ?? 0) * weighting_factor;
};

const getSpectralBeamSizeMID = (response: SensitivityCalculatorAPIResponseMid, type: number) => {
  const beams =
    type === TYPE_ZOOM ? response.weighting.data.beam_size : response.weightingLine.data.beam_size;
  return sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
    beams[0].beam_maj_scaled,
    beams[0].beam_min_scaled,
    1
  );
};

const getSpectralSBSMID = (
  response: SensitivityCalculatorAPIResponseMid,
  sense: number,
  type: number
) => {
  const conv_factor =
    type === TYPE_ZOOM
      ? response?.weighting?.data.sbs_conv_factor[0]
      : response?.weightingLine?.data.sbs_conv_factor[0];
  return sense * conv_factor;
};

/********************************************************************************************/

const getSensitivity = (confusionNoise: number, weightedSensitivity: number): number =>
  sensCalHelpers.calculate.sqrtOfSumSqs(confusionNoise * 1e6, weightedSensitivity);
