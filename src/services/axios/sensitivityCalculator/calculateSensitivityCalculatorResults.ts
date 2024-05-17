import sensCalHelpers from './sensCalHelpers';
import Observation from '../../../utils/types/observation';
import { SensCalcResult } from './getSensitivityCalculatorAPIData';
import { OBS_TYPES, STATUS_OK, TELESCOPE_LOW_NUM, TYPE_CONTINUUM, TYPE_ZOOM } from '../../../utils/constants';
import {
  SensitivityCalculatorAPIResponseLow,
  SensitivityCalculatorAPIResponseMid
} from './../../../utils/types/sensitivityCalculatorAPIResponse';
import Target from '../../../utils/types/target';

export default function calculateSensitivityCalculatorResults(
  response: any,
  observation: Observation,
  target: Target
): SensCalcResult {
  const isLOW = () => observation.telescope === TELESCOPE_LOW_NUM;
  console.log('1 -');
  const weightedSensitivity = isLOW()
    ? getWeightedSensitivityLOW(response, observation.type)
    : getWeightedSensitivityMID(response);
  console.log('1 -1');
  const confusionNoise: number = isLOW()
    ? getConfusionNoiseLOW(response)
    : getConfusionNoiseMID(response);
  console.log('1 -2');
  const totalSensitivity = getSensitivity(confusionNoise, weightedSensitivity);
  console.log('1 -3');
  const beamSize = isLOW() ? getBeamSizeLOW(response) : getBeamSizeMID(response);
  console.log('1 -4');
  const sbs = isLOW()
    ? getSBSLOW(response, totalSensitivity)
    : getSBSMID(response, totalSensitivity);
  console.log('2 -');
  const spectralWeightedSensitivity = isLOW()
    ? getSpectralWeightedSensitivityLOW(response, observation.type)
    : getSpectralWeightedSensitivityMID(response);
  console.log('3 -');
  const spectralConfusionNoise = isLOW()
    ? getSpectralConfusionNoiseLOW(response, observation.type)
    : getSpectralConfusionNoiseMID(response);
  console.log('3 -1');
  const spectralTotalSensitivity = getSensitivity(
    spectralConfusionNoise,
    spectralWeightedSensitivity
  );
  console.log('4 -');
  const spectralBeamSize = isLOW()
    ? getSpectralBeamSizeLOW(response, observation.type)
    : getSpectralBeamSizeMID(response);
  console.log('5 -');
  const spectralSbs = isLOW()
    ? getSpectralSBSLOW(response, spectralTotalSensitivity, observation.type)
    : getSpectralSBSMID(response, spectralTotalSensitivity);
  console.log('5 -1');
  const confusionNoiseDisplay = sensCalHelpers.format.convertSensitivityToDisplayValue(
    confusionNoise
  );
  console.log('6 -');
  const weightedSensitivityDisplay = sensCalHelpers.format.convertSensitivityToDisplayValue(
    weightedSensitivity
  );
  console.log('7 -');
  const totalSensitivityDisplay = sensCalHelpers.format.convertSensitivityToDisplayValue(
    totalSensitivity
  );
  console.log('8 -');
  const beamSizeDisplay = { value: beamSize, units: 'arcsecs2' };
  console.log('9 -');
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

  const theResults = {
    id: target.name,
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
  return theResults as SensCalcResult;
}

/******************************************* MID ********************************************/

const getConfusionNoiseLOW = (response: SensitivityCalculatorAPIResponseLow): number =>
  response.weighting.confusion_noise.value
    ? Number(response.weighting.confusion_noise.value[0])
    : 0;

const getWeightedSensitivityLOW = (response: SensitivityCalculatorAPIResponseLow, type:number) => {
  const sensitivity = type === TYPE_ZOOM ? response.calculate.data.spectral_sensitivity?.value : response.calculate.data.continuum_sensitivity?.value;
  return (sensitivity ?? 0) * response.weighting.weighting_factor;
}
  

const getBeamSizeLOW = (response: SensitivityCalculatorAPIResponseLow) =>
  sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
    response.weighting.beam_size[0].beam_maj_scaled,
    response.weighting.beam_size[0].beam_min_scaled,
    1
  );

const getSBSLOW = (response: SensitivityCalculatorAPIResponseLow, sense: number) =>
  sense * response.weighting.sbs_conv_factor[0];

/* -------------- */

const getSpectralConfusionNoiseLOW = (response: SensitivityCalculatorAPIResponseLow, type: number) => {
  const spectralConfusionNoise = type === TYPE_ZOOM ? response.weighting.confusion_noise.value[0] : response.weightingLine.confusion_noise.value[0];
  return spectralConfusionNoise;
}

const getSpectralWeightedSensitivityLOW = (response: SensitivityCalculatorAPIResponseLow, type:number) => {
  const weighting_factor = type === TYPE_ZOOM ? response.weighting.weighting_factor : response.weightingLine.weighting_factor;
  return (response.calculate.data.spectral_sensitivity?.value ?? 0) * weighting_factor;
}

const getSpectralBeamSizeLOW = (response: SensitivityCalculatorAPIResponseLow, type: number) => {
  const beams = type === TYPE_ZOOM ? response.weighting.beam_size : response.weightingLine.beam_size;
  sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
    beams[0].beam_maj_scaled,
    beams[0].beam_min_scaled,
    1
  );
}

const getSpectralSBSLOW = (response: SensitivityCalculatorAPIResponseLow, sense: number, type: number) => {
  console.log('::: in getSpectralSBSLOW', 'response', response);
  const conv_factor = type === TYPE_ZOOM ? response?.weighting?.sbs_conv_factor[0] : response?.weightingLine?.sbs_conv_factor[0];
  console.log('::: conv factor, response', conv_factor);
  return sense * conv_factor;
}


/******************************************* MID ********************************************/

const getConfusionNoiseMID = (response: SensitivityCalculatorAPIResponseMid): number =>
  response.weighting.data.confusion_noise.value
    ? Number(response.weighting.data.confusion_noise.value[0])
    : 0;

const getWeightedSensitivityMID = (response: SensitivityCalculatorAPIResponseMid) => // TO DO
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

const getSpectralConfusionNoiseMID = (response: SensitivityCalculatorAPIResponseMid) =>
  response.weightingLine.data.confusion_noise.value[0];

const getSpectralWeightedSensitivityMID = (response: SensitivityCalculatorAPIResponseMid) =>
  (response.calculate.data?.data?.result?.sensitivity ?? 0) *
  response.weightingLine.data.weighting_factor;

const getSpectralBeamSizeMID = (response: SensitivityCalculatorAPIResponseMid) =>
  sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
    response.weightingLine.data.beam_size[0].beam_maj_scaled,
    response.weightingLine.data.beam_size[0].beam_min_scaled,
    1
  );

const getSpectralSBSMID = (response: SensitivityCalculatorAPIResponseMid, sense: number) =>
  sense * response.weightingLine.data.sbs_conv_factor[0];

/********************************************************************************************/

const getSensitivity = (confusionNoise: number, weightedSensitivity: number): number =>
  sensCalHelpers.calculate.sqrtOfSumSqs(confusionNoise * 1e6, weightedSensitivity);
