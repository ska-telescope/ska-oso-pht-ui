import {
  ContinuumData,
  StandardData,
  Telescope,
  SubArrayResults
} from '../../../utils/types/typesSensCalc';
import {
  DECIMAL_PLACES,
  FREQUENCY_HZ,
  FREQUENCY_MHZ,
  OB_SUBARRAY_CUSTOM,
  SEPARATOR0,
  STATUS_OK,
  TIME_HOURS,
  TIME_SECS,
  RA_TYPE_GALACTIC,
  RA_TYPE_EQUATORIAL
} from '../../../utils/constantsSensCalc';
import {
  getImageWeightingMapping,
  getSensitivitiesUnitsMapping,
  isLow,
  isSuppliedTime,
  shiftSensitivity
} from '../../../utils/helpersSensCalc';
import {
  addFrequency,
  addRobustProperty,
  addTime,
  addValue,
  pointingCentre,
  rxBand
} from '../submissionEntries/submissionEntries';
import Fetch from '../fetch/Fetch';
import {
  BANDWIDTH_TELESCOPE,
  OBS_TYPES,
  OBSERVATION,
  SUPPLIED_TYPE_SENSITIVITY,
  TYPE_CONTINUUM
} from '../../../utils/constants';
import Target from 'utils/types/target';
// import { t } from 'i18next';
import { SensCalcResults, ResultsSection } from '../../../utils/types/sensCalcResults';
import Observation from '../../../utils/types/observation';
import { presentUnits } from '../../../utils/present';

const mapping = (data: any, target: Target, observation: Observation): SensCalcResults =>
  getFinalResults(target, data, observation);

//TODO: move to common folder
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

// from calculateSensitivityCalculatorResults.ts
function getFinalResults(target, results: any, theObservation): SensCalcResults {
  const isSuppliedSensitivity = () => theObservation.supplied.type === SUPPLIED_TYPE_SENSITIVITY;
  const isContinuum = () => theObservation.type === TYPE_CONTINUUM;

  const individualResults = getFinalIndividualResultsForContinuum(results, theObservation);

  const theResults: SensCalcResults = {
    id: target.id,
    title: target.name,
    statusGUI: STATUS_OK,
    section1: [],
    ...(isContinuum() && {
      section2: []
    }),
    section3: [individualResults.results11]
  };

  // Section 1
  if (!isSuppliedSensitivity()) {
    theResults.section1.push(individualResults.results1);
  }
  theResults.section1.push(individualResults.results2);
  if (!isSuppliedSensitivity()) {
    theResults.section1.push(individualResults.results3);
  }
  theResults.section1.push(individualResults.results4);
  theResults.section1.push(individualResults.results5);
  // Section 2
  if (isContinuum()) {
    if (!isSuppliedSensitivity()) {
      theResults.section2.push(individualResults.results6);
    }
    theResults.section2.push(individualResults.results7);
    if (!isSuppliedSensitivity()) {
      theResults.section2.push(individualResults.results8);
    }
    theResults.section2.push(individualResults.results9);
    theResults.section2.push(individualResults.results10);
  }

  console.log('[getContinuumData] getFinalResults theResults', theResults);

  return theResults;
}

const toFixed = (value: number) => {
  if (value === undefined || value === null) {
    return 0;
  }
  return Number(value).toFixed(DECIMAL_PLACES);
};

function getFinalIndividualResultsForContinuum(
  results: any,
  theObservation
): FinalIndividualResults {
  const isSuppliedSensitivity = () => theObservation.supplied.type === SUPPLIED_TYPE_SENSITIVITY;

  console.log('theObservation', theObservation);
  console.log('getContinuumData] getFinalIndividualResultsForContinuum results', results);

  let transformed_result = results.transformed_result;

  const observationTypeLabel: string = OBS_TYPES[theObservation.type];
  const suppliedType = OBSERVATION.Supplied.find(sup => sup.value === theObservation.supplied.type)
    ?.sensCalcResultsLabel;

  const shifted1 = shiftSensitivity(transformed_result?.weighted_continuum_sensitivity);
  const results1 = {
    field: `${observationTypeLabel}SensitivityWeighted`,
    value: shifted1.value.toString() ?? 0,
    units: shifted1.unit ?? 'ERR1'
  };

  const results2 = {
    field: `${observationTypeLabel}ConfusionNoise`,
    value: transformed_result?.spectral_confusion_noise?.value ?? 0,
    units: transformed_result?.spectral_confusion_noise?.unit ?? 'ERR2'
  };

  const shifted3 = shiftSensitivity(transformed_result?.total_continuum_sensitivity);
  const results3 = {
    field: `${observationTypeLabel}TotalSensitivity`,
    value: shifted3.value ?? 0,
    units: shifted3.unit ?? 'ERR3'
  };

  const results4 = {
    field: `${observationTypeLabel}SynthBeamSize`,
    value:
      toFixed(transformed_result?.continuum_synthesized_beam_size?.beam_maj.value).toString() +
      ' x ' +
      toFixed(transformed_result?.continuum_synthesized_beam_size?.beam_min.value).toString(),
    units: presentUnits(
      'arcsec2'
      // transformed_result?.continuum_synthesized_beam_size?.beam_maj.unit ?? 'ERR4'
    )
  };

  const results5 = {
    field: isSuppliedSensitivity()
      ? `${observationTypeLabel}IntegrationTime`
      : `${observationTypeLabel}SurfaceBrightnessSensitivity`,
    value: isSuppliedSensitivity()
      ? transformed_result?.continuum_integration_time?.value.toString()
      : transformed_result?.continuum_surface_brightness_sensitivity?.value.toString(),
    units: isSuppliedSensitivity()
      ? transformed_result?.continuum_integration_time?.unit ?? 'ERR5a'
      : transformed_result?.continuum_surface_brightness_sensitivity?.unit ?? 'ERR5b'
  };

  const shifted6 = shiftSensitivity(transformed_result?.weighted_spectral_sensitivity);
  const results6 = {
    field: 'spectralSensitivityWeighted',
    value: shifted6.value?.toString() ?? 0,
    units: shifted6.unit ?? 'ERR6'
  };

  const results7 = {
    field: 'spectralConfusionNoise',
    value: transformed_result?.spectral_confusion_noise?.value?.toString() ?? 0,
    units: transformed_result?.spectral_confusion_noise?.unit ?? 'ERR7'
  };

  const shifted8 = shiftSensitivity(transformed_result?.total_spectral_sensitivity);
  const results8 = {
    field: 'spectralTotalSensitivity',
    value: shifted8.value?.toString() ?? 0,
    units: shifted8.unit ?? 'ERR8'
  };

  const results9 = {
    field: 'spectralSynthBeamSize',
    value:
      toFixed(transformed_result?.spectral_synthesized_beam_size?.beam_maj.value).toString() +
      ' x ' +
      toFixed(transformed_result?.spectral_synthesized_beam_size?.beam_min.value).toString(),
    units: presentUnits('arcsec2') // transformed_result?.spectral_synthesized_beam_size?.beam_maj.unit ?? 'ERR9')
  };

  const results10 = {
    field: isSuppliedSensitivity()
      ? 'spectralIntegrationTime'
      : 'spectralSurfaceBrightnessSensitivity',
    value: isSuppliedSensitivity()
      ? transformed_result?.spectral_integration_time?.value?.toString() ?? 0
      : transformed_result?.spectral_surface_brightness_sensitivity?.value?.toString() ?? 0,
    units: isSuppliedSensitivity()
      ? transformed_result?.spectral_integration_time?.unit ?? 'ERR10a'
      : transformed_result?.spectral_surface_brightness_sensitivity?.unit ?? 'ERR10b'
  };

  const results11 = {
    field: suppliedType,
    value: theObservation?.supplied?.value?.toString() ?? 0,
    units:
      OBSERVATION.Supplied.find(s => s.sensCalcResultsLabel === suppliedType)?.units?.find(
        u => u.value === theObservation.supplied.units
      )?.label ?? 'ERR11'
  };

  const updated_results = {
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

  console.log('updated_results', updated_results);

  return updated_results;
}

// TODO handle warnings and check it works as expected
/*
  - add in translations
  - see in which section should this go?
  */
// if (isCustom) {
//   addWarningData([t('customWarning.warning')], results, 'warningCustom');
// } else if (isNatural) {
//   addWarningData([t('noEstimateWarning.warning')], results, 'warningNoEstimate');
// }

// wData?.warnings.forEach((e: any) => addWarningObject(e, results));

const addPropertiesLOW = (standardData: StandardData, continuumData: ContinuumData) => {
  let properties = '';
  if (standardData.subarray !== OB_SUBARRAY_CUSTOM) {
    properties += addValue('subarray_configuration', standardData.subarray, SEPARATOR0);
  } else {
    properties += addValue('num_stations', standardData.numStations, SEPARATOR0);
  }
  if (isSuppliedTime(continuumData.suppliedType)) {
    properties += addTime('integration_time_h', continuumData.supplied_0, TIME_HOURS);
  } else {
    properties += addValue('sensitivity_jy', continuumData.supplied_1.value);
  }
  properties += pointingCentre(standardData);
  properties += addValue('elevation_limit', Number(standardData.elevation.value));
  properties += addFrequency('freq_centre_mhz', continuumData.centralFrequency, FREQUENCY_MHZ);
  properties += addValue('spectral_averaging_factor', continuumData.spectralAveraging);
  properties += addFrequency('bandwidth_mhz', continuumData.bandwidth, FREQUENCY_MHZ);
  properties += addValue('n_subbands', continuumData.numberOfSubBands);
  properties += addValue('weighting_mode', getImageWeightingMapping(continuumData.imageWeighting));
  properties = addRobustProperty(continuumData, properties);
  return properties;
};

const addPropertiesMID = (
  standardData: StandardData,
  continuumData: ContinuumData,
  subArrayResults: SubArrayResults | undefined
) => {
  let properties = '';
  if (isSuppliedTime(continuumData.suppliedType)) {
    properties += addTime('integration_time_s', continuumData.supplied_0, TIME_SECS, SEPARATOR0);
  } else {
    properties += addValue('supplied_sensitivity', continuumData.supplied_1.value, SEPARATOR0);
    properties += addValue(
      'sensitivity_unit',
      getSensitivitiesUnitsMapping(Number(continuumData.supplied_1.unit))
    );
  }
  properties += rxBand(standardData.observingBand);

  if (standardData.subarray !== OB_SUBARRAY_CUSTOM) {
    properties += addValue('subarray_configuration', standardData.subarray);
  } else {
    properties += addValue('n_ska', standardData.num15mAntennas);
    properties += addValue('n_meer', standardData.num13mAntennas);
  }
  properties += addFrequency('freq_centre_hz', continuumData.centralFrequency, FREQUENCY_HZ);
  properties += addFrequency('bandwidth_hz', continuumData.bandwidth, FREQUENCY_HZ);
  properties += addValue('spectral_averaging_factor', continuumData.spectralAveraging);
  properties += pointingCentre(standardData);
  properties += addValue('pmv', Number(standardData.weather.value));
  properties += addValue('el', Number(standardData.elevation.value));
  properties += addValue('n_subbands', continuumData.numberOfSubBands);
  properties += addValue('weighting_mode', getImageWeightingMapping(continuumData.imageWeighting));
  properties += addValue('taper', continuumData.tapering);
  properties = addRobustProperty(continuumData, properties);
  return properties;
};

function getContinuumData(
  telescope: Telescope,
  subArrayResults: SubArrayResults | undefined,
  observation: Observation,
  target: Target
) {
  const URL_PATH = `/continuum/calculate`;

  const continuumData: ContinuumData = {
    dataType: observation.type,
    bandwidth: {
      value: observation?.continuumBandwidth,
      unit: observation?.continuumBandwidthUnits.toString()
    },
    effectiveResolution: observation?.effectiveResolution,
    suppliedType: observation?.supplied?.type,
    supplied_0: {
      value: observation?.supplied?.value,
      unit: observation?.supplied?.units?.toString()
    },
    supplied_1: {
      value: observation?.supplied?.value,
      unit: observation?.supplied?.units?.toString()
    },
    centralFrequency: {
      value: observation?.centralFrequency,
      unit: observation?.centralFrequencyUnits?.toString()
    },
    numberOfSubBands: observation?.numSubBands,
    spectralAveraging: observation?.spectralAveraging,
    imageWeighting: observation?.imageWeighting,
    robust: observation?.robust,
    tapering: observation?.tapering
  };

  const standardData: StandardData = {
    observingBand: BANDWIDTH_TELESCOPE.find(band => band.value === observation.observingBand)
      ?.mapping, // TODO handle band 5a and 5b correctly
    weather: { value: observation.weather, unit: 'mm' },
    subarray: OBSERVATION.array
      .find(t => t.value === observation.telescope)
      ?.subarray?.find(s => s.value === observation.subarray)?.map, // TODO handle custom subarray
    num15mAntennas: observation.num15mAntennas,
    num13mAntennas: observation.num13mAntennas,
    numStations: observation.numStations,
    skyDirectionType: RA_TYPE_GALACTIC,
    raGalactic: { value: target.ra, unit: RA_TYPE_GALACTIC },
    decGalactic: { value: target.dec, unit: RA_TYPE_GALACTIC },
    raEquatorial: { value: undefined, unit: RA_TYPE_EQUATORIAL },
    decEquatorial: { value: undefined, unit: RA_TYPE_EQUATORIAL },
    elevation: { value: observation.elevation, unit: 'deg' },
    advancedData: undefined,
    modules: []
  };

  let properties = isLow(telescope)
    ? addPropertiesLOW(standardData, continuumData)
    : addPropertiesMID(standardData, continuumData, subArrayResults);
  const response = Fetch(
    telescope,
    URL_PATH,
    properties,
    mapping,
    standardData,
    continuumData,
    target,
    observation
  );
  return response;
}
export default getContinuumData;
