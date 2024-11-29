import sensCalHelpers from './sensCalHelpers';
import Observation from '../../../utils/types/observation';
import { SensCalcResults } from '../../../utils/types/sensCalcResults';
import {
  LOW_BEAM_SIZE_PRECISION,
  MID_BEAM_SIZE_PRECISION,
  OB_SUBARRAY_CUSTOM,
  OBS_TYPES,
  OBSERVATION,
  STATUS_OK,
  SUPPLIED_TYPE_SENSITIVITY,
  TELESCOPE_LOW_NUM,
  TYPE_CONTINUUM,
  TYPE_ZOOM
} from '../../../utils/constants';
import {
  SensitivityCalculatorAPIResponseLow,
  SensitivityCalculatorAPIResponseMid
} from './../../../utils/types/sensitivityCalculatorAPIResponse';
import Target from '../../../utils/types/target';
import { ValueUnitPair } from 'utils/types/valueUnitPair';

// STAR-612 : Note that the actual calculation for this will be done in a separate ticket

/*
STAR-781 - TODO check results since change affecting spectral results
=> returning spectral results with continuum in url, not zoom
this is correct but returns different values than when set as zoom
=> seems to have solved spectral sensitivity results issue for low?
=> correct results: Low A4, Low AA05
=> TODO check other results
*/

export default function calculateSensitivityCalculatorResults(
  response: any,
  observation: Observation,
  target: Target
): SensCalcResults {
  const isLow = () => observation.telescope === TELESCOPE_LOW_NUM;
  const isZoom = () => observation.type === TYPE_ZOOM;
  const isSensitivity = () => observation.supplied.type === SUPPLIED_TYPE_SENSITIVITY;
  const isContinuum = () => observation.type === TYPE_CONTINUUM;
  const isCustomSubarray = () => observation.subarray === OB_SUBARRAY_CUSTOM;

  const weightedSensitivity = isLow()
    ? getWeightedSensitivityLOW(response, isZoom(), isCustomSubarray())
    : getWeightedSensitivityMid(response, isZoom(), observation);

  const confusionNoise = getConfusionNoise(response, isZoom(), isCustomSubarray());

  const totalSensitivity = getSensitivity(confusionNoise, weightedSensitivity);
  const beamSize = isLow()
    ? getBeamSizeLOW(response, isZoom(), isCustomSubarray())
    : getBeamSizeMID(response, isZoom());

  const continuumIntegrationTime = isSensitivity()
    ? getContinuumIntegrationTimeMID(response, isZoom())
    : { value: 0, unit: '' };
  const spectralIntegrationTime: any = isSensitivity()
    ? getSpectralIntegrationTimeMID(response, isZoom(), isCustomSubarray())
    : { value: 0, unit: '' };

  const spectralWeightedSensitivity = isLow()
    ? getSpectralWeightedSensitivityLOW(response, isZoom(), isCustomSubarray())
    : getSpectralWeightedSensitivityMID(observation, response, isZoom());

  const spectralConfusionNoise = getSpectralConfusionNoise(response, isZoom(), isCustomSubarray());

  const spectralTotalSensitivity = getSensitivity(
    spectralConfusionNoise,
    spectralWeightedSensitivity
  );

  const getSurfaceBrightnessSensitivity = (
    response: SensitivityCalculatorAPIResponseLow | SensitivityCalculatorAPIResponseMid,
    sense: number,
    isZoom: boolean,
    isCustom
  ): ValueUnitPair => {
    if (isCustom) {
      return { value: 0, unit: '' };
    } else {
      const rec = isZoom ? response?.weighting[0] : response?.weighting;
      const rawSurfaceBrightnessSensitivity = rec ? sense * rec?.sbs_conv_factor : 0;
      return rec
        ? sensCalHelpers.format.convertKelvinsToDisplayValue(rawSurfaceBrightnessSensitivity)
        : { value: 0, unit: '' };
    }
  };

  const sbs = getSurfaceBrightnessSensitivity(
    response,
    isZoom() ? spectralTotalSensitivity : totalSensitivity,
    isZoom(),
    isCustomSubarray()
  );

  const spectralSbs = isLow()
    ? getSpectralSurfaceBrightnessLOW(
        response,
        spectralTotalSensitivity,
        isZoom(),
        isCustomSubarray()
      )
    : getSpectralSurfaceBrightnessMID(response, spectralTotalSensitivity, isZoom());

  const spectralBeamSize = isLow()
    ? getSpectralBeamSizeLOW(response, isZoom(), isCustomSubarray())
    : getSpectralBeamSizeMID(response, isZoom());

  const convertSuppliedSensitivityToDisplayValue = (suppliedSensitivity: number) => {
    const suppliedSensitivityUnits = OBSERVATION.Supplied.find(
      item => item.value === SUPPLIED_TYPE_SENSITIVITY
    ).units;
    const displayValue = {
      value: suppliedSensitivity,
      unit: suppliedSensitivityUnits.find(u => u.value === observation.supplied.units)?.label
    };
    return displayValue;
  };

  const getCustomResultDisplayValue = (): any => {
    return { value: 'N/A', units: '' };
  };

  const confusionNoiseDisplay = isCustomSubarray()
    ? getCustomResultDisplayValue()
    : sensCalHelpers.format.convertReturnedSensitivityToDisplayValue(confusionNoise);
  const weightedSensitivityDisplay = isSensitivity()
    ? convertSuppliedSensitivityToDisplayValue(weightedSensitivity)
    : sensCalHelpers.format.convertReturnedSensitivityToDisplayValue(weightedSensitivity);
  const totalSensitivityDisplay = isCustomSubarray()
    ? getCustomResultDisplayValue()
    : sensCalHelpers.format.convertReturnedSensitivityToDisplayValue(
        isZoom() ? spectralTotalSensitivity : totalSensitivity
      );
  const beamSizeDisplay = isCustomSubarray()
    ? getCustomResultDisplayValue()
    : { value: beamSize, units: 'arcsec2' };

  const spectralConfusionNoiseDisplay = isCustomSubarray()
    ? getCustomResultDisplayValue()
    : sensCalHelpers.format.convertReturnedSensitivityToDisplayValue(spectralConfusionNoise);

  const spectralWeightedSensitivityDisplay = isSensitivity()
    ? convertSuppliedSensitivityToDisplayValue(spectralWeightedSensitivity)
    : sensCalHelpers.format.convertReturnedSensitivityToDisplayValue(spectralWeightedSensitivity);

  const spectralTotalSensitivityDisplay = isCustomSubarray()
    ? getCustomResultDisplayValue()
    : sensCalHelpers.format.convertReturnedSensitivityToDisplayValue(spectralTotalSensitivity);
  const spectralBeamSizeDisplay = isCustomSubarray()
    ? getCustomResultDisplayValue()
    : { value: spectralBeamSize, units: 'arcsec2' };

  const observationTypeLabel: string = OBS_TYPES[observation.type];

  const suppliedType = OBSERVATION.Supplied.find(sup => sup.value === observation.supplied.type)
    ?.sensCalcResultsLabel;

  const results1 = {
    field: `${observationTypeLabel}SensitivityWeighted`,
    value: isZoom()
      ? spectralWeightedSensitivityDisplay?.value.toString()
      : weightedSensitivityDisplay?.value.toString(),
    units: weightedSensitivityDisplay?.unit
  };

  const results2 = {
    field: `${observationTypeLabel}ConfusionNoise`,
    value: isZoom()
      ? spectralConfusionNoiseDisplay?.value.toString()
      : confusionNoiseDisplay?.value.toString(),
    units: confusionNoiseDisplay?.unit
  };

  const results3 = {
    field: `${observationTypeLabel}TotalSensitivity`,
    value: isZoom()
      ? spectralTotalSensitivityDisplay?.value.toString()
      : totalSensitivityDisplay?.value.toString(),
    units: totalSensitivityDisplay?.unit
  };

  const results4 = {
    field: `${observationTypeLabel}SynthBeamSize`,
    value: beamSizeDisplay?.value,
    units: beamSizeDisplay?.units
  };

  const results5 = {
    field: isSensitivity()
      ? `${observationTypeLabel}IntegrationTime`
      : `${observationTypeLabel}SurfaceBrightnessSensitivity`,
    value: isSensitivity() ? continuumIntegrationTime?.value.toString() : sbs?.value.toString(),
    units: isSensitivity() ? continuumIntegrationTime?.unit : sbs?.unit
  };

  const results6 = {
    field: 'spectralSensitivityWeighted',
    value: spectralWeightedSensitivityDisplay.value.toString(),
    units: spectralWeightedSensitivityDisplay.unit // TODO set correct unit when using supplied sensitivity
  };

  const results7 = {
    field: 'spectralConfusionNoise',
    value: spectralConfusionNoiseDisplay?.value.toString(),
    units: spectralConfusionNoiseDisplay?.unit
  };

  const results8 = {
    field: 'spectralTotalSensitivity',
    value: spectralTotalSensitivityDisplay.value.toString(),
    units: spectralTotalSensitivityDisplay.unit
  };

  const results9 = {
    field: 'spectralSynthBeamSize',
    value: spectralBeamSizeDisplay?.value,
    units: spectralBeamSizeDisplay?.units
  };

  const results10 = {
    field: isSensitivity() ? 'spectralIntegrationTime' : 'spectralSurfaceBrightnessSensitivity',
    value: isSensitivity()
      ? spectralIntegrationTime?.value.toString()
      : spectralSbs?.value.toString(),
    units: isSensitivity() ? spectralIntegrationTime?.unit : spectralSbs?.unit
  };

  const results11 = {
    field: suppliedType,
    value: observation.supplied.value.toString(),
    units: OBSERVATION.Supplied.find(s => s.sensCalcResultsLabel === suppliedType)?.units?.find(
      u => u.value === observation.supplied.units
    )?.label
  };

  const theResults: SensCalcResults = {
    id: target.id,
    title: target.name,
    statusGUI: STATUS_OK,
    section1: [],
    ...(isContinuum() && {
      section2: []
    }),
    section3: [results11]
  };

  // Section 1
  if (!isSensitivity()) {
    theResults.section1.push(results1);
  }
  theResults.section1.push(results2);
  if (!isSensitivity()) {
    theResults.section1.push(results3);
  }
  theResults.section1.push(results4);
  theResults.section1.push(results5);
  // Section 2
  if (isContinuum()) {
    if (!isSensitivity()) {
      theResults.section2.push(results6);
    }
    theResults.section2.push(results7);
    if (!isSensitivity()) {
      theResults.section2.push(results8);
    }
    theResults.section2.push(results9);
    theResults.section2.push(results10);
  }

  console.log('THE RESULTS', theResults);

  return theResults;
}

/******************************************* LOW ********************************************/

const getWeightingFactor = (
  response: SensitivityCalculatorAPIResponseLow,
  isZoom: boolean,
  isCustom: boolean
): number => {
  if (isCustom) {
    return 1; // no weighting response for Custom
  } else {
    return isZoom ? response.weighting[0]?.weighting_factor : response.weighting?.weighting_factor;
  }
};

// SARAH
const getWeightedSensitivityLOW = (
  response: SensitivityCalculatorAPIResponseLow,
  isZoom: boolean,
  isCustom: boolean
) => {
  console.log('::: in getWeightedSensitivityLOW');
  console.log('::: response', response);
  const sensitivity = isZoom
    ? response.calculate.data[0].spectral_sensitivity?.value
    : response?.calculate?.data?.continuum_sensitivity?.value;
  const factor = getWeightingFactor(response, isZoom, isCustom);
  return sensitivity * factor;
};

const getBeamSizeLOW = (
  response: SensitivityCalculatorAPIResponseLow,
  isZoom: boolean,
  isCustom: boolean
): string => {
  if (isCustom) {
    return 'N/A';
  } else {
    const rec = isZoom ? response.weighting[0] : response.weighting;
    return sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
      rec?.beam_size.beam_maj_scaled,
      rec?.beam_size.beam_min_scaled,
      LOW_BEAM_SIZE_PRECISION
    );
  }
};

/* -------------- */

const getSpectralWeightedSensitivityLOW = (
  response: SensitivityCalculatorAPIResponseLow,
  isZoom: boolean,
  isCustom: boolean
) => {
  if (isCustom) {
    return isZoom
      ? response.calculate?.data[0].spectral_sensitivity.value
      : response.calculate.data.spectral_sensitivity?.value;
  } else {
    const rec = isZoom ? response.weighting[0] : response.weightingLine;
    const calc = isZoom ? response.calculate?.data[0] : response.calculate?.data;
    return (calc?.spectral_sensitivity?.value ?? 0) * (rec?.weighting_factor ?? 1); // TODO check to remove '??'
  }
};

const getSpectralBeamSizeLOW = (
  response: SensitivityCalculatorAPIResponseLow,
  isZoom: boolean,
  isCustom: boolean
) => {
  if (isCustom) {
    return 'N/A';
  } else {
    const rec = isZoom ? response.weighting[0]?.beam_size : response.weightingLine?.beam_size;
    const formattedBeams = sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
      rec?.beam_maj_scaled,
      rec?.beam_min_scaled,
      LOW_BEAM_SIZE_PRECISION
    );
    return formattedBeams;
  }
};

const getSpectralSurfaceBrightnessLOW = (
  response: SensitivityCalculatorAPIResponseLow,
  sense: number,
  isZoom: boolean,
  isCustom: boolean
) => {
  if (isCustom) {
    return { value: 'N/A', unit: '' };
  } else {
    const rec = isZoom ? response.weighting[0] : response.weightingLine;
    return rec
      ? sensCalHelpers.format.convertKelvinsToDisplayValue(sense * rec.sbs_conv_factor)
      : { value: 0, unit: '' };
  }
};

/******************************************* MID ********************************************/

const getWeightedSensitivityRawValueMid = (
  response: SensitivityCalculatorAPIResponseMid,
  isZoom: boolean,
  observation: Observation
) => {
  const recCalc = isZoom ? response?.calculate?.data[0] : response?.calculate?.data;
  const recWeight = isZoom ? response?.weighting[0] : response?.weighting;
  if (recCalc?.continuum_sensitivity?.value) {
    return recCalc.continuum_sensitivity!.value! * (recWeight?.weighting_factor ?? 1) * 1e6;
  } else {
    return observation?.supplied.value;
  }
};

const getWeightedSensitivityMid = (
  response: SensitivityCalculatorAPIResponseMid,
  isZoom: boolean,
  observation: Observation
) => {
  return getWeightedSensitivityRawValueMid(response, isZoom, observation);
};

const getBeamSizeMID = (response: SensitivityCalculatorAPIResponseMid, isZoom): string => {
  const rec = isZoom ? response?.weighting[0] : response?.weighting;
  if (rec) {
    return sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
      rec?.beam_size?.beam_maj_scaled,
      rec?.beam_size?.beam_min_scaled,
      MID_BEAM_SIZE_PRECISION
    );
  } else {
    return '';
  }
};

/* -------------- */

const getSpectralWeightedSensitivityRawValueMid = (
  observation: Observation,
  response: SensitivityCalculatorAPIResponseMid,
  isZoom: boolean
) => {
  const recCalc = isZoom ? response?.calculate?.data[0] : response?.calculate?.data;
  const recWeightLine = isZoom ? response?.weighting[0] : response?.weightingLine;
  if (recCalc?.spectral_sensitivity?.value) {
    return recCalc.spectral_sensitivity?.value! * (recWeightLine?.weighting_factor ?? 1) * 1e6;
  } else {
    return observation?.supplied.value;
  }
};

const getContinuumIntegrationTimeMID = (
  response: {
    calculate: { data: { spectral_integration_time: any; continuum_integration_time: any } };
  },
  isZoom: boolean
): ValueUnitPair => {
  const integrationTime = isZoom
    ? response.calculate?.data[0]?.spectral_integration_time
    : response.calculate?.data?.continuum_integration_time;
  return convertIntegrationTimeUnits(integrationTime);
};

const convertIntegrationTimeUnits = (integrationTime: ValueUnitPair): ValueUnitPair =>
  sensCalHelpers.format.convertTimeToDisplayUnit(integrationTime);

const getSpectralIntegrationTimeMID = (
  response: SensitivityCalculatorAPIResponseMid,
  isZoom: boolean,
  isCustom: boolean
): ValueUnitPair => {
  const integrationTime =
    isCustom || isZoom // for custom array we only have 1 get calculate request for supplied sensitivity
      ? response.calculate?.data?.spectral_integration_time
      : response.calculateSpectral?.data?.spectral_integration_time;
  return convertIntegrationTimeUnits(integrationTime);
};

const getSpectralWeightedSensitivityMID = (
  observation: Observation,
  response: SensitivityCalculatorAPIResponseMid,
  isZoom: boolean
) => {
  return getSpectralWeightedSensitivityRawValueMid(observation, response, isZoom);
};

const getSpectralBeamSizeMID = (response: SensitivityCalculatorAPIResponseMid, isZoom: boolean) => {
  const rec = isZoom ? response?.weighting[0]?.beam_size : response?.weightingLine?.beam_size;
  if (!rec) {
    return null;
  }
  const formattedBeams = sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
    rec.beam_maj_scaled,
    rec.beam_min_scaled,
    MID_BEAM_SIZE_PRECISION
  );
  return formattedBeams;
};

const getSpectralSurfaceBrightnessMID = (
  response: SensitivityCalculatorAPIResponseMid,
  sense: number,
  isZoom: boolean
) => {
  const conv_factor = isZoom
    ? response?.weighting[0]?.sbs_conv_factor
    : response?.weightingLine?.sbs_conv_factor;
  return conv_factor
    ? sensCalHelpers.format.convertKelvinsToDisplayValue(sense * conv_factor)
    : { value: 0, unit: '' };
};

/********************************************* COMMON ***********************************************/

const getSensitivity = (confusionNoise: number, weightedSensitivity: number): number =>
  sensCalHelpers.calculate.sqrtOfSumSqs(confusionNoise, weightedSensitivity);

const getConfusionNoise = (
  response: SensitivityCalculatorAPIResponseLow,
  isZoom: boolean,
  isCustom: boolean
): number => {
  const rawConfusionNoise = getRawConfusionNoise(response, isZoom, isCustom);
  return rawConfusionNoise
    ? sensCalHelpers.format.convertConfusionNoiseRawValueInuJy(Number(rawConfusionNoise))
    : 0;
};

const getSpectralConfusionNoise = (
  response: SensitivityCalculatorAPIResponseLow | SensitivityCalculatorAPIResponseMid,
  isZoom: boolean,
  isCustom: boolean
) => {
  const rawSpectralConfusionNoise = getSpectralRawConfusionNoise(response, isZoom, isCustom);
  return rawSpectralConfusionNoise
    ? sensCalHelpers.format.convertConfusionNoiseRawValueInuJy(Number(rawSpectralConfusionNoise))
    : 0;
};

const getRawConfusionNoise = (
  response: SensitivityCalculatorAPIResponseLow,
  isZoom: boolean,
  isCustom: boolean
): number => {
  if (isCustom) {
    return 0;
  } else {
    return isZoom
      ? response.weighting[0]?.confusion_noise?.value
      : response.weighting?.confusion_noise?.value;
  }
};

const getSpectralRawConfusionNoise = (
  response: SensitivityCalculatorAPIResponseLow | SensitivityCalculatorAPIResponseMid,
  isZoom: boolean,
  isCustom: boolean
): number => {
  if (isCustom) {
    return 0;
  } else {
    return isZoom
      ? response.weighting[0]?.confusion_noise?.value
      : response.weightingLine?.confusion_noise?.value;
  }
};
