import sensCalHelpers from './sensCalHelpers';
import Observation from '../../../utils/types/observation';
import { ResultsSection, SensCalcResults } from '../../../utils/types/sensCalcResults';
import {
  BEAM_SIZE_UNITS,
  LOW_BEAM_SIZE_PRECISION,
  MID_BEAM_SIZE_PRECISION,
  NOT_APPLICABLE,
  OB_SUBARRAY_CUSTOM,
  OBS_TYPES,
  OBSERVATION,
  STATUS_OK,
  SUPPLIED_TYPE_SENSITIVITY,
  TELESCOPE_LOW_NUM,
  TYPE_CONTINUUM,
  TYPE_ZOOM,
  WEIGHTING_FACTOR_DEFAULT
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

let theObservation: Observation = null;

/********************************************* COMMON ***********************************************/

const getCustomResultDisplayValue = (): any => {
  return { value: 0, unit: NOT_APPLICABLE };
};
const isCustomSubarray = () => theObservation.subarray === OB_SUBARRAY_CUSTOM;
const isLow = () => theObservation.telescope === TELESCOPE_LOW_NUM;
const isZoom = () => theObservation.type === TYPE_ZOOM;
const isSuppliedSensitivity = () => theObservation.supplied.type === SUPPLIED_TYPE_SENSITIVITY;
const isContinuum = () => theObservation.type === TYPE_CONTINUUM;

const getSurfaceBrightnessSensitivity = (
  response: SensitivityCalculatorAPIResponseLow | SensitivityCalculatorAPIResponseMid,
  sense: number
): ValueUnitPair => {
  if (isCustomSubarray()) {
    return getCustomResultDisplayValue();
  }
  const rec = isZoom() ? response?.weighting[0] : response?.weighting;
  const rawSurfaceBrightnessSensitivity = rec ? sense * rec?.sbs_conv_factor : 0;
  return rec
    ? sensCalHelpers.format.convertKelvinsToDisplayValue(rawSurfaceBrightnessSensitivity)
    : { value: 0, unit: '' }; // TODO check if condition needed
};

const convertSuppliedSensitivityToDisplayValue = (suppliedSensitivity: number) => {
  const suppliedSensitivityUnits = OBSERVATION.Supplied.find(
    item => item.value === SUPPLIED_TYPE_SENSITIVITY
  ).units;
  const displayValue = {
    value: suppliedSensitivity,
    unit: suppliedSensitivityUnits.find(u => u.value === theObservation.supplied.units)?.label
  };
  return displayValue;
};

const getWeightingFactor = (response: SensitivityCalculatorAPIResponseLow): number => {
  if (isCustomSubarray()) {
    return WEIGHTING_FACTOR_DEFAULT; // no weighting response for Custom
  }
  return isZoom() ? response.weighting[0]?.weighting_factor : response.weighting?.weighting_factor;
};

const getSensitivity = (confusionNoise: number, weightedSensitivity: number): number =>
  sensCalHelpers.calculate.sqrtOfSumSqs(confusionNoise, weightedSensitivity);

const getConfusionNoise = (response: SensitivityCalculatorAPIResponseLow): number => {
  const rawConfusionNoise = getRawConfusionNoise(response);
  return sensCalHelpers.format.convertConfusionNoiseRawValueInuJy(Number(rawConfusionNoise));
};

const getSpectralConfusionNoise = (
  response: SensitivityCalculatorAPIResponseLow | SensitivityCalculatorAPIResponseMid
) => {
  const rawSpectralConfusionNoise = getSpectralRawConfusionNoise(response);
  return sensCalHelpers.format.convertConfusionNoiseRawValueInuJy(
    Number(rawSpectralConfusionNoise)
  );
};

const getRawConfusionNoise = (response: SensitivityCalculatorAPIResponseLow): number => {
  if (isCustomSubarray()) {
    return 0;
  }
  return isZoom()
    ? response.weighting[0]?.confusion_noise?.value
    : response.weighting?.confusion_noise?.value;
};

const getSpectralRawConfusionNoise = (
  response: SensitivityCalculatorAPIResponseLow | SensitivityCalculatorAPIResponseMid
): number => {
  if (isCustomSubarray()) {
    return 0;
  }
  return isZoom()
    ? response.weighting[0]?.confusion_noise?.value
    : response.weightingLine?.confusion_noise?.value;
};

/******************************************* LOW ********************************************/

const getWeightedSensitivityLOW = (response: SensitivityCalculatorAPIResponseLow) => {
  const sensitivity = isZoom()
    ? response.calculate.data[0].spectral_sensitivity?.value
    : response?.calculate?.data?.continuum_sensitivity?.value;
  const factor = getWeightingFactor(response);
  return sensitivity * factor;
};

const getBeamSizeLOW = (response: SensitivityCalculatorAPIResponseLow): string => {
  if (isCustomSubarray()) {
    return NOT_APPLICABLE;
  }
  const rec = isZoom() ? response.weighting[0] : response.weighting;
  return sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
    rec?.beam_size.beam_maj_scaled,
    rec?.beam_size.beam_min_scaled,
    LOW_BEAM_SIZE_PRECISION
  );
};

const getSpectralWeightedSensitivityLOW = (response: SensitivityCalculatorAPIResponseLow) => {
  if (isCustomSubarray()) {
    return isZoom()
      ? response.calculate?.data[0].spectral_sensitivity.value
      : response.calculate.data.spectral_sensitivity?.value;
  } else {
    const rec = isZoom() ? response.weighting[0] : response.weightingLine;
    const calc = isZoom() ? response.calculate?.data[0] : response.calculate?.data;
    return (calc?.spectral_sensitivity?.value ?? 0) * rec?.weighting_factor;
  }
};

const getSpectralBeamSizeLOW = (response: SensitivityCalculatorAPIResponseLow) => {
  if (isCustomSubarray()) {
    return NOT_APPLICABLE;
  }
  const rec = isZoom() ? response.weighting[0]?.beam_size : response.weightingLine?.beam_size;
  const formattedBeams = sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
    rec?.beam_maj_scaled,
    rec?.beam_min_scaled,
    LOW_BEAM_SIZE_PRECISION
  );
  return formattedBeams;
};

const getSpectralSurfaceBrightnessLOW = (
  response: SensitivityCalculatorAPIResponseLow,
  sense: number
) => {
  if (isCustomSubarray()) {
    return getCustomResultDisplayValue();
  }
  const rec = isZoom() ? response.weighting[0] : response.weightingLine;
  return sensCalHelpers.format.convertKelvinsToDisplayValue(sense * rec.sbs_conv_factor);
};

/******************************************* MID ********************************************/

const getWeightedSensitivityRawValueMid = (response: SensitivityCalculatorAPIResponseMid) => {
  const sensitivity = isZoom()
    ? response.calculate.data[0].continuum_sensitivity?.value
    : response?.calculate?.data?.continuum_sensitivity?.value;
  const factor = getWeightingFactor(response);
  return sensitivity * factor * 1e6;
};

const getSuppliedSensitivity = () => {
  return theObservation?.supplied.value;
};

const getWeightedSensitivityMid = (response: SensitivityCalculatorAPIResponseMid) => {
  return isSuppliedSensitivity()
    ? getSuppliedSensitivity()
    : getWeightedSensitivityRawValueMid(response);
};

const getBeamSizeMID = (response: SensitivityCalculatorAPIResponseMid): string => {
  if (isCustomSubarray()) {
    return NOT_APPLICABLE;
  }
  const rec = isZoom() ? response?.weighting[0] : response?.weighting;
  return sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
    rec?.beam_size?.beam_maj_scaled,
    rec?.beam_size?.beam_min_scaled,
    MID_BEAM_SIZE_PRECISION
  );
};

const getSpectralWeightedSensitivityRawValueMid = (
  response: SensitivityCalculatorAPIResponseMid
) => {
  const recCalc = isZoom() ? response?.calculate?.data[0] : response?.calculate?.data;
  if (!recCalc?.spectral_sensitivity?.value) {
    return theObservation?.supplied.value; // for supplied sensitivity cases
  }
  if (isCustomSubarray()) {
    return recCalc.spectral_sensitivity?.value! * 1e6;
  }
  const recWeightLine = isZoom() ? response?.weighting[0] : response?.weightingLine;
  return recCalc.spectral_sensitivity?.value! * recWeightLine?.weighting_factor * 1e6;
};

const getContinuumIntegrationTimeMID = (response: {
  calculate: { data: { spectral_integration_time: any; continuum_integration_time: any } };
}): ValueUnitPair => {
  let integrationTime;
  if (isCustomSubarray()) {
    integrationTime = isZoom()
      ? response.calculate?.data[0].spectral_integration_time
      : response.calculate?.data.continuum_integration_time;
  } else {
    integrationTime = isZoom()
      ? response.calculate?.data[0]?.spectral_integration_time
      : response.calculate?.data?.continuum_integration_time;
  }
  return convertIntegrationTimeUnits(integrationTime);
};

const convertIntegrationTimeUnits = (integrationTime: ValueUnitPair): ValueUnitPair => {
  return sensCalHelpers.format.convertTimeToDisplayUnit(integrationTime);
};

const getSpectralIntegrationTimeMID = (
  response: SensitivityCalculatorAPIResponseMid
): ValueUnitPair => {
  let integrationTime;
  if (isCustomSubarray()) {
    integrationTime = isZoom()
      ? response.calculate?.data[0]?.spectral_integration_time
      : response.calculate?.data?.spectral_integration_time;
  } else {
    integrationTime = isZoom() // for custom array we only have 1 get calculate request for supplied sensitivity
      ? response.calculate?.data?.spectral_integration_time
      : response.calculateSpectral?.data?.spectral_integration_time;
  }
  return convertIntegrationTimeUnits(integrationTime);
};

const getSpectralWeightedSensitivityMID = (response: SensitivityCalculatorAPIResponseMid) => {
  return getSpectralWeightedSensitivityRawValueMid(response);
};

const getSpectralBeamSizeMID = (response: SensitivityCalculatorAPIResponseMid): string => {
  if (isCustomSubarray()) {
    return NOT_APPLICABLE;
  }
  const rec = isZoom() ? response?.weighting[0]?.beam_size : response?.weightingLine?.beam_size;
  const formattedBeams = sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
    rec.beam_maj_scaled,
    rec.beam_min_scaled,
    MID_BEAM_SIZE_PRECISION
  );
  return formattedBeams;
};

const getSpectralSurfaceBrightnessMID = (
  response: SensitivityCalculatorAPIResponseMid,
  sense: number
) => {
  if (isCustomSubarray()) {
    return getCustomResultDisplayValue();
  }
  const conv_factor = isZoom()
    ? response?.weighting[0]?.sbs_conv_factor
    : response?.weightingLine?.sbs_conv_factor;
  return conv_factor
    ? sensCalHelpers.format.convertKelvinsToDisplayValue(sense * conv_factor)
    : { value: 0, unit: '' };
};

/* **************************************************************************************** */

interface RawResults {
  weightedSensitivity: number;
  confusionNoise: number;
  totalSensitivity: number;
  beamSize: string;
  continuumIntegrationTime: ValueUnitPair;
  spectralIntegrationTime: ValueUnitPair;
  spectralWeightedSensitivity: number;
  spectralConfusionNoise: number;
  spectralTotalSensitivity: number;
  sbs: ValueUnitPair;
  spectralSbs: ValueUnitPair;
  spectralBeamSize: string;
}

interface DisplayResults {
  confusionNoiseDisplay: ValueUnitPair;
  weightedSensitivityDisplay: ValueUnitPair;
  totalSensitivityDisplay: ValueUnitPair;
  beamSizeDisplay: { value: string; unit: string };
  spectralConfusionNoiseDisplay: ValueUnitPair;
  spectralWeightedSensitivityDisplay: ValueUnitPair;
  spectralTotalSensitivityDisplay: ValueUnitPair;
  spectralBeamSizeDisplay: { value: string; unit: string };
  sbs: ValueUnitPair;
  spectralSbs: ValueUnitPair;
  continuumIntegrationTime: ValueUnitPair;
  spectralIntegrationTime: ValueUnitPair;
}

interface FinalIndividualResults {
  results1: ResultsSection;
  results2: ResultsSection;
  results3: ResultsSection;
  results4: ResultsSection;
  results5: ResultsSection;
  results6: ResultsSection;
  results7: ResultsSection;
  results8: ResultsSection;
  results9: ResultsSection;
  results10: ResultsSection;
  results11: ResultsSection;
}

function getResultValues(response): RawResults {
  const weightedSensitivity = isLow()
    ? getWeightedSensitivityLOW(response)
    : getWeightedSensitivityMid(response);

  const confusionNoise = getConfusionNoise(response);

  const totalSensitivity = getSensitivity(confusionNoise, weightedSensitivity);

  const beamSize = isLow() ? getBeamSizeLOW(response) : getBeamSizeMID(response);

  const continuumIntegrationTime = isSuppliedSensitivity()
    ? getContinuumIntegrationTimeMID(response)
    : { value: 0, unit: '' };

  const spectralIntegrationTime: any = isSuppliedSensitivity()
    ? getSpectralIntegrationTimeMID(response)
    : { value: 0, unit: '' };

  const spectralWeightedSensitivity = isLow()
    ? getSpectralWeightedSensitivityLOW(response)
    : getSpectralWeightedSensitivityMID(response);

  const spectralConfusionNoise = getSpectralConfusionNoise(response);

  const spectralTotalSensitivity = getSensitivity(
    spectralConfusionNoise,
    spectralWeightedSensitivity
  );

  const sbs = getSurfaceBrightnessSensitivity(
    response,
    isZoom() ? spectralTotalSensitivity : totalSensitivity
  );

  const spectralSbs = isLow()
    ? getSpectralSurfaceBrightnessLOW(response, spectralTotalSensitivity)
    : getSpectralSurfaceBrightnessMID(response, spectralTotalSensitivity);

  const spectralBeamSize = isLow()
    ? getSpectralBeamSizeLOW(response)
    : getSpectralBeamSizeMID(response);

  return {
    weightedSensitivity,
    confusionNoise,
    totalSensitivity,
    beamSize,
    continuumIntegrationTime,
    spectralIntegrationTime,
    spectralWeightedSensitivity,
    spectralConfusionNoise,
    spectralTotalSensitivity,
    sbs,
    spectralSbs,
    spectralBeamSize
  };
}

function getDisplayResultValues(results: RawResults): DisplayResults {
  const confusionNoiseDisplay = isCustomSubarray()
    ? getCustomResultDisplayValue()
    : sensCalHelpers.format.convertReturnedSensitivityToDisplayValue(results.confusionNoise);

  const weightedSensitivityDisplay = isSuppliedSensitivity()
    ? convertSuppliedSensitivityToDisplayValue(results.weightedSensitivity)
    : sensCalHelpers.format.convertReturnedSensitivityToDisplayValue(results.weightedSensitivity);

  const totalSensitivityDisplay = isCustomSubarray()
    ? getCustomResultDisplayValue()
    : sensCalHelpers.format.convertReturnedSensitivityToDisplayValue(
        isZoom() ? results.spectralTotalSensitivity : results.totalSensitivity
      );

  const beamSizeDisplay = {
    value: results.beamSize,
    unit: isCustomSubarray() ? NOT_APPLICABLE : BEAM_SIZE_UNITS
  };

  const spectralConfusionNoiseDisplay = isCustomSubarray()
    ? getCustomResultDisplayValue()
    : sensCalHelpers.format.convertReturnedSensitivityToDisplayValue(
        results.spectralConfusionNoise
      );

  const spectralWeightedSensitivityDisplay = isSuppliedSensitivity()
    ? convertSuppliedSensitivityToDisplayValue(results.spectralWeightedSensitivity)
    : sensCalHelpers.format.convertReturnedSensitivityToDisplayValue(
        results.spectralWeightedSensitivity
      );

  const spectralTotalSensitivityDisplay = isCustomSubarray()
    ? getCustomResultDisplayValue()
    : sensCalHelpers.format.convertReturnedSensitivityToDisplayValue(
        results.spectralTotalSensitivity
      );

  const spectralBeamSizeDisplay = {
    value: results.spectralBeamSize,
    unit: isCustomSubarray() ? NOT_APPLICABLE : BEAM_SIZE_UNITS
  };

  return {
    confusionNoiseDisplay,
    weightedSensitivityDisplay,
    totalSensitivityDisplay,
    beamSizeDisplay,
    spectralConfusionNoiseDisplay,
    spectralWeightedSensitivityDisplay,
    spectralTotalSensitivityDisplay,
    spectralBeamSizeDisplay,
    sbs: results.sbs,
    spectralSbs: results.spectralSbs,
    continuumIntegrationTime: results.continuumIntegrationTime,
    spectralIntegrationTime: results.spectralIntegrationTime
  };
}

function getFinalIndividualResults(results: DisplayResults): FinalIndividualResults {
  const observationTypeLabel: string = OBS_TYPES[theObservation.type];
  const suppliedType = OBSERVATION.Supplied.find(sup => sup.value === theObservation.supplied.type)
    ?.sensCalcResultsLabel;

  const results1 = {
    field: `${observationTypeLabel}SensitivityWeighted`,
    value: isZoom()
      ? results.spectralWeightedSensitivityDisplay?.value.toString()
      : results.weightedSensitivityDisplay?.value.toString(),
    units: results.weightedSensitivityDisplay?.unit
  };
  const results2 = {
    field: `${observationTypeLabel}ConfusionNoise`,
    value: isZoom()
      ? results.spectralConfusionNoiseDisplay?.value.toString()
      : results.confusionNoiseDisplay?.value.toString(),
    units: results.confusionNoiseDisplay?.unit
  };
  const results3 = {
    field: `${observationTypeLabel}TotalSensitivity`,
    value: isZoom()
      ? results.spectralTotalSensitivityDisplay?.value.toString()
      : results.totalSensitivityDisplay?.value.toString(),
    units: results.totalSensitivityDisplay?.unit
  };
  const results4 = {
    field: `${observationTypeLabel}SynthBeamSize`,
    value: results.beamSizeDisplay?.value,
    units: results.beamSizeDisplay?.unit
  };
  const results5 = {
    field: isSuppliedSensitivity()
      ? `${observationTypeLabel}IntegrationTime`
      : `${observationTypeLabel}SurfaceBrightnessSensitivity`,
    value: isSuppliedSensitivity()
      ? results.continuumIntegrationTime?.value.toString()
      : results.sbs?.value.toString(),
    units: isSuppliedSensitivity() ? results.continuumIntegrationTime?.unit : results.sbs?.unit
  };
  const results6 = {
    field: 'spectralSensitivityWeighted',
    value: results.spectralWeightedSensitivityDisplay.value.toString(),
    units: results.spectralWeightedSensitivityDisplay.unit // TODO set correct unit when using supplied sensitivity
  };
  const results7 = {
    field: 'spectralConfusionNoise',
    value: results.spectralConfusionNoiseDisplay?.value.toString(),
    units: results.spectralConfusionNoiseDisplay?.unit
  };
  const results8 = {
    field: 'spectralTotalSensitivity',
    value: results.spectralTotalSensitivityDisplay.value.toString(),
    units: results.spectralTotalSensitivityDisplay.unit
  };
  const results9 = {
    field: 'spectralSynthBeamSize',
    value: results.spectralBeamSizeDisplay?.value,
    units: results.spectralBeamSizeDisplay?.unit
  };
  const results10 = {
    field: isSuppliedSensitivity()
      ? 'spectralIntegrationTime'
      : 'spectralSurfaceBrightnessSensitivity',
    value: isSuppliedSensitivity()
      ? results.spectralIntegrationTime?.value.toString()
      : results.spectralSbs?.value.toString(),
    units: isSuppliedSensitivity()
      ? results.spectralIntegrationTime?.unit
      : results.spectralSbs?.unit
  };
  const results11 = {
    field: suppliedType,
    value: theObservation.supplied.value.toString(),
    units: OBSERVATION.Supplied.find(s => s.sensCalcResultsLabel === suppliedType)?.units?.find(
      u => u.value === theObservation.supplied.units
    )?.label
  };

  return {
    results1,
    results2,
    results3,
    results4,
    results5,
    results6,
    results7,
    results8,
    results9,
    results10,
    results11
  };
}

function getFinalResults(target, results: any): SensCalcResults {
  const individualresults = getFinalIndividualResults(results);

  const theResults: SensCalcResults = {
    id: target.id,
    title: target.name,
    statusGUI: STATUS_OK,
    section1: [],
    ...(isContinuum() && {
      section2: []
    }),
    section3: [individualresults.results11]
  };

  // Section 1
  if (!isSuppliedSensitivity()) {
    theResults.section1.push(individualresults.results1);
  }
  theResults.section1.push(individualresults.results2);
  if (!isSuppliedSensitivity()) {
    theResults.section1.push(individualresults.results3);
  }
  theResults.section1.push(individualresults.results4);
  theResults.section1.push(individualresults.results5);
  // Section 2
  if (isContinuum()) {
    if (!isSuppliedSensitivity()) {
      theResults.section2.push(individualresults.results6);
    }
    theResults.section2.push(individualresults.results7);
    if (!isSuppliedSensitivity()) {
      theResults.section2.push(individualresults.results8);
    }
    theResults.section2.push(individualresults.results9);
    theResults.section2.push(individualresults.results10);
  }

  return theResults;
}

export default function calculateSensitivityCalculatorResults(
  response: any,
  observation: Observation,
  target: Target
): SensCalcResults {
  theObservation = observation;
  const rawResults = getResultValues(response);
  const displayResults = getDisplayResultValues(rawResults);
  const resultsFinal = getFinalResults(target, displayResults);

  return resultsFinal;
}
