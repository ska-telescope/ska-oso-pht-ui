import sensCalHelpers from './sensCalHelpers';
import Observation from '../../../utils/types/observation';
import { SensCalcResults } from '../../../utils/types/sensCalcResults';
import {
  OBS_TYPES,
  OBSERVATION,
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
  const isLow = () => observation.telescope === TELESCOPE_LOW_NUM;
  const isZoom = () => observation.type === TYPE_ZOOM;

  const weightedSensitivity = isLow()
    ? getWeightedSensitivityLOW(response, isZoom())
    : getWeightedSensitivityMID(response);
  const confusionNoise: number = isLow()
    ? getConfusionNoiseLOW(response, isZoom())
    : getConfusionNoiseMID(response);
  const totalSensitivity = getSensitivity(confusionNoise, weightedSensitivity);
  const beamSize = isLow() ? getBeamSizeLOW(response, isZoom()) : getBeamSizeMID(response);
  const sbs = isLow()
    ? getSBSLOW(response, totalSensitivity, isZoom())
    : getSBSMID(response, totalSensitivity);
  const spectralWeightedSensitivity = isLow()
    ? getSpectralWeightedSensitivityLOW(response, isZoom())
    : getSpectralWeightedSensitivityMID(response, observation.type);
  const spectralConfusionNoise = isLow()
    ? getSpectralConfusionNoiseLOW(response, isZoom())
    : getSpectralConfusionNoiseMID(response, observation.type);
  const spectralTotalSensitivity = getSensitivity(
    spectralConfusionNoise,
    spectralWeightedSensitivity
  );
  const spectralBeamSize = isLow()
    ? getSpectralBeamSizeLOW(response, isZoom())
    : getSpectralBeamSizeMID(response, observation.type);
  const spectralSbs = isLow()
    ? getSpectralSurfaceBrightnessLOW(response, spectralTotalSensitivity, isZoom())
    : getSpectralSurfaceBrightnessMID(response, spectralTotalSensitivity, isZoom());
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

  const suppliedType = OBSERVATION.Supplied.find(sup => sup.value === observation.supplied.type)
    ?.sensCalcResultsLabel;

  const theResults: SensCalcResults = {
    id: target.id,
    title: target.name,
    statusGUI: STATUS_OK,
    section1: [
      {
        field: `${observationTypeLabel}SensitivityWeighted`,
        value: weightedSensitivityDisplay?.value.toString(),
        units: weightedSensitivityDisplay?.unit
      },
      {
        field: `${observationTypeLabel}ConfusionNoise`,
        value: confusionNoiseDisplay?.value.toString(),
        units: confusionNoiseDisplay?.unit
      },
      {
        field: `${observationTypeLabel}TotalSensitivity`,
        value: totalSensitivityDisplay?.value.toString(),
        units: totalSensitivityDisplay?.unit
      },
      {
        field: `${observationTypeLabel}SynthBeamSize`,
        value: beamSizeDisplay?.value,
        units: beamSizeDisplay?.units
      },
      {
        field: `${observationTypeLabel}SurfaceBrightnessSensitivity`,
        value: sbsDisplay?.value.toString(),
        units: sbsDisplay?.units
      }
    ],
    // only return section2 if continuum
    ...(observation.type === TYPE_CONTINUUM && {
      section2: [
        {
          field: 'spectralSensitivityWeighted',
          value: spectralWeightedSensitivityDisplay.value.toString(),
          units: spectralWeightedSensitivityDisplay.unit
        },
        {
          field: 'spectralConfusionNoise',
          value: spectralConfusionNoiseDisplay?.value.toString(),
          units: spectralConfusionNoiseDisplay?.unit
        },
        {
          field: 'spectralTotalSensitivity',
          value: spectralTotalSensitivityDisplay.value.toString(),
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
        field: suppliedType,
        value: observation.supplied.value.toString(),
        units: OBSERVATION.Supplied.find(s => s.sensCalcResultsLabel === suppliedType)?.units?.find(
          u => u.value === observation.supplied.units
        )?.label
      }
    ]
  };
  return theResults;
}

/******************************************* LOW ********************************************/

const getConfusionNoiseLOW = (response: SensitivityCalculatorAPIResponseLow, isZoom): number =>
  isZoom ? getConfusionNoiseZoomLOW(response) : getConfusionNoiseContinuumLOW(response);

const getConfusionNoiseContinuumLOW = (response: SensitivityCalculatorAPIResponseLow): number =>
  response.weighting.confusion_noise.value ? Number(response.weighting.confusion_noise.value) : 0;

const getConfusionNoiseZoomLOW = (response: SensitivityCalculatorAPIResponseLow): number =>
  response.weighting[0].confusion_noise.value
    ? Number(response.weighting[0].confusion_noise.value)
    : 0;

const getWeightedSensitivityLOW = (
  response: SensitivityCalculatorAPIResponseLow,
  isZoom: boolean
) => {
  const sensitivity = isZoom
    ? response.calculate.data.spectral_sensitivity?.value
    : response.calculate.data.continuum_sensitivity?.value;
  const factor = isZoom
    ? response.weighting[0].weighting_factor
    : response.weighting.weighting_factor;
  return (sensitivity ?? 0) * factor;
};

const getBeamSizeLOW = (response: SensitivityCalculatorAPIResponseLow, isZoom): string => {
  const rec = isZoom ? response.weighting[0] : response.weightingLine[0];
  return sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
    rec.beam_size.beam_maj_scaled,
    rec.beam_size.beam_min_scaled,
    1
  );
};

const getSBSLOW = (
  response: SensitivityCalculatorAPIResponseLow,
  sense: number,
  isZoom: boolean
) => {
  const rec = isZoom ? response.weighting[0] : response.weightingLine[0];
  return sense * rec.sbs_conv_factor;
};

/* -------------- */

const getSpectralConfusionNoiseLOW = (
  response: SensitivityCalculatorAPIResponseLow,
  isZoom: Boolean
) => {
  const spectralConfusionNoise = isZoom
    ? response.weighting[0].confusion_noise.value
    : response.weighting.confusion_noise.value;
  return spectralConfusionNoise;
};

const getSpectralWeightedSensitivityLOW = (
  response: SensitivityCalculatorAPIResponseLow,
  isZoom: boolean
) => {
  const rec = isZoom ? response.weighting[0] : response.weightingLine[0];
  const calc = isZoom ? response.calculate.data[0] : response.calculate.data;
  return (calc.spectral_sensitivity?.value ?? 0) * rec.weighting_factor;
};

const getSpectralBeamSizeLOW = (response: SensitivityCalculatorAPIResponseLow, isZoom: boolean) => {
  const rec = isZoom ? response.weighting[0].beam_size : response.weightingLine[0].beam_size;
  const formattedBeams = sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
    rec.beam_maj_scaled,
    rec.beam_min_scaled,
    1
  );
  return formattedBeams;
};

const getSpectralSurfaceBrightnessLOW = (
  response: SensitivityCalculatorAPIResponseLow,
  sense: number,
  isZoom: boolean
) => {
  const rec = isZoom ? response.weighting[0] : response.weightingLine[0];
  return sense * rec.sbs_conv_factor;
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
  const formattedBeams = sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
    beams[0].beam_maj_scaled,
    beams[0].beam_min_scaled,
    1
  );
  return formattedBeams;
};

const getSpectralSurfaceBrightnessMID = (
  response: SensitivityCalculatorAPIResponseMid,
  sense: number,
  isZoom: boolean
) => {
  const conv_factor = isZoom
    ? response?.weighting?.data.sbs_conv_factor[0]
    : response?.weightingLine?.data.sbs_conv_factor[0];
  return sense * conv_factor;
};

/********************************************************************************************/

const getSensitivity = (confusionNoise: number, weightedSensitivity: number): number =>
  sensCalHelpers.calculate.sqrtOfSumSqs(confusionNoise * 1e6, weightedSensitivity);
