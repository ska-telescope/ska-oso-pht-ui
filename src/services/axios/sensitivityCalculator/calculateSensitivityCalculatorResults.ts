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
  response: any,
  observation: Observation,
  target: Target
): SensCalcResult {
  console.log('::: in calculateSensitivityCalculatorResults', );
  console.log('::: response test', response);
  console.log('::: observation', observation);
  console.log('::: target', target);
  const isLOW = () => observation.telescope === TELESCOPE_LOW_NUM;
  const weightedSensitivity = isLOW()
    ? getWeightedSensitivityLOW(response)
    : getWeightedSensitivityMID(response);
  const confusionNoise: number = isLOW()
    ? getConfusionNoiseLOW(response)
    : getConfusionNoiseMID(response);
  console.log('::: CHECK0');
  const totalSensitivity = getSensitivity(confusionNoise, weightedSensitivity);
  console.log('::: CHECK0 -2');
  const beamSize = isLOW() ? getBeamSizeLOW(response) : getBeamSizeMID(response);
  console.log('::: CHECK1');
  const sbs = isLOW()
    ? getSBSLOW(response, totalSensitivity)
    : getSBSMID(response, totalSensitivity);
  console.log('::: CHECK1 -2');
  const spectralWeightedSensitivity = isLOW()
    ? getSpectralWeightedSensitivityLOW(response)
    : getSpectralWeightedSensitivityMID(response);
    console.log('spectralWeightedSensitivity', spectralWeightedSensitivity);
    console.log('::: CHECK1 -3');
  const spectralConfusionNoise = isLOW()
    ? getSpectralConfusionNoiseLOW(response)
    : getSpectralConfusionNoiseMID(response);
    console.log('::: CHECK1 -3');
  const spectralTotalSensitivity = getSensitivity(
    spectralConfusionNoise,
    spectralWeightedSensitivity
  );
  console.log('::: CHECK2');
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

  console.log('::: CHECK3');
  const spectralConfusionNoiseDisplay =
    observation.type === TYPE_CONTINUUM
      ? sensCalHelpers.format.convertSensitivityToDisplayValue(spectralConfusionNoise)
      : { value: '', units: '' };
  console.log('::: CHECK 3-2');
  const spectralWeightedSensitivityDisplay = sensCalHelpers.format.convertSensitivityToDisplayValue(
    spectralWeightedSensitivity
  );
  console.log('::: CHECK 3-3');
  const spectralTotalSensitivityDisplay = sensCalHelpers.format.convertSensitivityToDisplayValue(
    spectralTotalSensitivity
  );
  console.log('::: CHECK4');
  const spectralBeamSizeDisplay = { value: spectralBeamSize, units: 'arcsecs2' };
  const spectralSbsDisplay = { value: spectralSbs, units: 'k' };

  const observationTypeLabel: string = OBS_TYPES[observation.type];

  console.log('::: I AM HERE');

  const theResults = {
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
        value: observation.integrationTime,
        units: sensCalHelpers.format.getIntegrationTimeUnitsLabel(observation.integrationTimeUnits)
      }
    ]
  };
  console.log('::: theResults', theResults);
  return theResults as SensCalcResult;
}

/******************************************* MID ********************************************/

const getConfusionNoiseLOW = (response: SensitivityCalculatorAPIResponseLow): number =>
  response.weighting.confusion_noise.value
    ? Number(response.weighting.confusion_noise.value[0])
    : 0;

const getWeightedSensitivityLOW = (response: SensitivityCalculatorAPIResponseLow) => {
  return (
    (response.calculate.data.continuum_sensitivity.value ?? 0) * response.weighting.weighting_factor
  );
};

const getBeamSizeLOW = (response: SensitivityCalculatorAPIResponseLow) => {
    console.log('::: in getBeamSizeLOW');
    sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
      response.weighting.beam_size[0].beam_maj_scaled,
      response.weighting.beam_size[0].beam_min_scaled,
      1
    );
  };

const getSBSLOW = (response: SensitivityCalculatorAPIResponseLow, sense: number) =>
  sense * response.weighting.sbs_conv_factor[0];

/* -------------- */

const getSpectralConfusionNoiseLOW = (response: SensitivityCalculatorAPIResponseLow) =>
  response.weightingLine.confusion_noise.value[0];

const getSpectralWeightedSensitivityLOW = (response: SensitivityCalculatorAPIResponseLow) =>
  (response.calculate.data.spectral_sensitivity.value ?? 0) *
  response.weightingLine.weighting_factor;

const getSpectralBeamSizeLOW = (response: SensitivityCalculatorAPIResponseLow) =>
  sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
    response.weightingLine.beam_size[0].beam_maj_scaled,
    response.weightingLine.beam_size[0].beam_min_scaled,
    1
  );

const getSpectralSBSLOW = (response: SensitivityCalculatorAPIResponseLow, sense: number) =>
  sense * response.weightingLine.sbs_conv_factor[0];

/******************************************* MID ********************************************/

const getConfusionNoiseMID = (response: SensitivityCalculatorAPIResponseMid): number => {
  return response.weighting.data.confusion_noise.value
    ? Number(response.weighting.data.confusion_noise.value[0])
    : 0;
};

const getWeightedSensitivityMID = (response: SensitivityCalculatorAPIResponseMid) =>
  (response.calculate?.data?.result?.sensitivity ?? 0) * response.weighting?.data?.weighting_factor;

const getBeamSizeMID = (response: SensitivityCalculatorAPIResponseMid) => {
  console.log('::: in getBeamSizeMID');
  console.log('::: response', response);
  try {
    sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
      response.weighting.data.beam_size[0].beam_maj_scaled,
      response.weighting.data.beam_size[0].beam_min_scaled,
      1
    );
  } catch (e) {
    console.log('e', e);
    return { error: e };
  }
  }

const getSBSMID = (response: SensitivityCalculatorAPIResponseMid, sense: number) =>

  sense * response.weighting.data.sbs_conv_factor[0];

/* -------------- */

const getSpectralConfusionNoiseMID = (response: SensitivityCalculatorAPIResponseMid) =>
  response.weightingLine.data.confusion_noise.value[0];

const getSpectralWeightedSensitivityMID = (response: SensitivityCalculatorAPIResponseMid) => {
  console.log('::: in getSpectralWeightedSensitivityMID', response);
  (response.calculate.data?.result?.sensitivity ?? 0) *
  response.weightingLine.data.weighting_factor;
};

const getSpectralBeamSizeMID = (response: SensitivityCalculatorAPIResponseMid) => {
  console.log('::: in getSpectralBeamSizeMID', getSpectralBeamSizeMID);
  sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
    response.weightingLine.data.beam_size[0].beam_maj_scaled,
    response.weightingLine.data.beam_size[0].beam_min_scaled,
    1
  );
};

const getSpectralSBSMID = (response: SensitivityCalculatorAPIResponseMid, sense: number) =>
  sense * response.weightingLine.data.sbs_conv_factor[0];

/********************************************************************************************/

const getSensitivity = (confusionNoise: number, weightedSensitivity: number) =>
  sensCalHelpers.calculate.sqrtOfSumSqs(confusionNoise * 1e6, weightedSensitivity);
