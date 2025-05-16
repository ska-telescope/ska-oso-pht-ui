import { CONTINUUM_DATA_MOCKED } from './mockedContinuumResults';
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
  MOCKED_API,
  OB_SUBARRAY_CUSTOM,
  SEPARATOR0,
  STATUS_ERROR,
  STATUS_OK,
  SUPPLIED_TYPE_INTEGRATION,
  TIME_HOURS,
  TIME_SECS,
  WEIGHTING_CORRECTION_FACTOR_30_PERCENT_BANDWIDTH,
  WEIGHTING_CORRECTION_FACTOR_SINGLE_CHANNEL,
  RA_TYPE_GALACTIC,
  RA_TYPE_EQUATORIAL,
  IW_NATURAL
} from '../../../utils/constantsSensCalc';
import {
  combineSensitivityAndWeightingFactor,
  getBeamSize,
  getImageWeightingMapping,
  getSensitivitiesUnitsMapping,
  isLow,
  isSuppliedTime,
  shiftSensitivity,
  shiftSensitivityK,
  shiftTime
} from '../../../utils/helpersSensCalc';
import {
  addAdvancedData,
  addFrequency,
  addMainData,
  addMapping,
  addMappingString,
  addRobustProperty,
  addSubBandResultData,
  addTime,
  addValue,
  addWarningData,
  addWarningObject,
  pointingCentre,
  rxBand,
  subArrayLookup
} from '../submissionEntries/submissionEntries';
import Fetch from '../fetch/Fetch';
import {
  BANDWIDTH_TELESCOPE,
  OBS_TYPES,
  OBSERVATION,
  SUPPLIED_TYPE_SENSITIVITY,
  TYPE_CONTINUUM,
  TYPE_ZOOM
} from '../../../utils/constants';
import Target from 'utils/types/target';
// import { t } from 'i18next';
import { SensCalcResults, ResultsSection } from 'utils/types/sensCalcResults';
import Observation from 'utils/types/observation';

const findCData = (data: any) => (data?.calculate ? data.calculate : data);
const findWData = (data: any) => (data?.transformed_result ? data?.transformed_result : null);

const findWeightingFactorContinuum = (data: any) => {
  let wFactor = 1;
  if (data?.continuum_weighting?.weighting_factor) {
    wFactor = data?.continuum_weighting?.weighting_factor;
  } else if (data?.weighting?.continuum_weighting?.weighting_factor) {
    wFactor = data?.weighting?.continuum_weighting?.weighting_factor;
  }
  return wFactor;
};

const findWeightingFactorSpectral = (data: any) => {
  let wFactor = 1;
  if (data?.spectral_weighting?.weighting_factor) {
    wFactor = data?.spectral_weighting?.weighting_factor;
  } else if (data?.weighting?.spectral_weighting?.weighting_factor) {
    wFactor = data?.weighting?.spectral_weighting?.weighting_factor;
  }
  return wFactor;
};

const mappingSpectralSensitivity = (data: any) =>
  addMappingString(
    'spectralSensitivity',
    combineSensitivityAndWeightingFactor(
      shiftSensitivity(findWData(data)?.weighted_spectral_sensitivity),
      findWeightingFactorSpectral(data),
      WEIGHTING_CORRECTION_FACTOR_SINGLE_CHANNEL
    )
  );

// Sarah's mapping function - ask for clarification
// export const mapping = (
//   data: any,
//   dataS: StandardData,
//   dataContinuum: ContinuumData,
//   target: Target
// ): SensCalcResults => {
//   const isCustom = dataS.subarray === OB_SUBARRAY_CUSTOM;
//   const cData = findCData(data);

//   const isNatural = dataContinuum.imageWeighting === IW_NATURAL;

//   if (cData?.warnings?.length) {
//     // return {
//     //   id: 1,
//     //   statusGUI: STATUS_ERROR,
//     //   error: '',
//     //   results: cData?.warnings
//     // };
//     return {
//       id: target.id,
//       title: target.name,
//       statusGUI: STATUS_ERROR,
//       error: '',
//       section1: cData?.warnings,
//       section2: cData?.warnings,
//       section3: cData?.warnings
//       // TODO we probably want warnings in 1 section instead of repeating them?
//     };
//   }

//   const wData = findWData(data);

//   const results: any[] = [];
//   const section1: ResultsSection[] = [];
//   const section2: ResultsSection[] = [];
//   const section3: ResultsSection[] = [];

//   if (wData) {
//     if ('weighted_continuum_sensitivity' in wData) {
//       section1.push(
//         addMappingString(
//           'continuumSensitivityWeighted',
//           combineSensitivityAndWeightingFactor(
//             shiftSensitivity(wData?.weighted_continuum_sensitivity),
//             findWeightingFactorContinuum(data),
//             WEIGHTING_CORRECTION_FACTOR_30_PERCENT_BANDWIDTH
//           )
//         )
//       );
//     }
//     if ('continuum_confusion_noise' in wData) {
//       addMainData(
//         section1,
//         'continuumConfusionNoise',
//         wData?.continuum_confusion_noise,
//         addMapping('continuumConfusionNoise', shiftSensitivity(wData?.continuum_confusion_noise)),
//         isCustom
//       );
//     }
//     if ('total_continuum_sensitivity' in wData) {
//       addMainData(
//         section1,
//         'continuumSensitivity',
//         wData?.total_continuum_sensitivity,
//         addMapping('continuumSensitivity', shiftSensitivity(wData?.total_continuum_sensitivity)),
//         isCustom
//       );
//     }
//     if ('continuum_synthesized_beam_size' in wData) {
//       addMainData(
//         section1,
//         'continuumSynthBeamSize',
//         wData?.continuum_synthesized_beam_size,
//         addMappingString(
//           'continuumSynthBeamSize',
//           getBeamSize(wData?.continuum_synthesized_beam_size, DECIMAL_PLACES)
//         ),
//         isCustom
//       );
//     }
//     if ('continuum_surface_brightness_sensitivity' in wData) {
//       addMainData(
//         section1,
//         'continuumSurfaceBrightnessSensitivity',
//         wData?.continuum_surface_brightness_sensitivity,
//         addMapping(
//           'continuumSurfaceBrightnessSensitivity',
//           shiftSensitivityK(wData?.continuum_surface_brightness_sensitivity)
//         ),
//         isCustom
//       );
//     }

//     if ('continuum_integration_time' in wData) {
//       section1.push(
//         addMapping('continuumIntegrationTime', shiftTime(wData?.continuum_integration_time, true))
//       );
//     }
//     addSubBandResultData(data, results);

//     if ('weighted_spectral_sensitivity' in wData) {
//       section1.push(mappingSpectralSensitivity(data));
//     }

//     if ('spectral_confusion_noise' in wData) {
//       addMainData(
//         section2,
//         'spectralConfusionNoise',
//         wData?.spectral_confusion_noise,
//         addMapping('spectralConfusionNoise', shiftSensitivity(wData?.spectral_confusion_noise)),
//         isCustom
//       );
//     }

//     if ('total_spectral_sensitivity' in wData) {
//       addMainData(
//         section2,
//         'spectralTotalSensitivity',
//         wData?.total_spectral_sensitivity,
//         addMapping('spectralTotalSensitivity', shiftSensitivity(wData?.total_spectral_sensitivity)),
//         isCustom
//       );
//     }

//     if ('spectral_synthesized_beam_size' in wData) {
//       addMainData(
//         section2,
//         'spectralSynthBeamSize',
//         wData?.spectral_synthesized_beam_size,
//         addMappingString(
//           'spectralSynthBeamSize',
//           getBeamSize(wData?.spectral_synthesized_beam_size, DECIMAL_PLACES)
//         ),
//         isCustom
//       );
//     }

//     if ('spectral_surface_brightness_sensitivity' in wData) {
//       addMainData(
//         section2,
//         'spectralSurfaceBrightnessSensitivity',
//         wData?.spectral_surface_brightness_sensitivity,
//         addMapping(
//           'spectralSurfaceBrightnessSensitivity',
//           shiftSensitivityK(wData?.spectral_surface_brightness_sensitivity)
//         ),
//         isCustom
//       );
//     }
//     if ('spectral_integration_time' in wData) {
//       section2.push(
//         addMapping('spectralIntegrationTime', shiftTime(wData?.spectral_integration_time, true))
//       );
//     }
//   }

//   if (cData.spectropolarimetry_results) {
//     if ('fwhm_of_the_rmsf' in cData.spectropolarimetry_results) {
//       section3.push(
//         addMapping('fwhmOfTheRmsf', cData?.spectropolarimetry_results.fwhm_of_the_rmsf)
//       );
//     }

//     if ('max_faraday_depth_extent' in cData.spectropolarimetry_results) {
//       section3.push(
//         addMapping(
//           'maxFaradayDepthExtent',
//           cData?.spectropolarimetry_results.max_faraday_depth_extent
//         )
//       );
//     }

//     if ('max_faraday_depth' in cData.spectropolarimetry_results) {
//       section3.push(
//         addMapping('maxFaradayDepth', cData?.spectropolarimetry_results.max_faraday_depth)
//       );
//     }
//   }

// const output = {
//   id: target.id,
//   title: target.name,
//   statusGUI: STATUS_OK,
//   error: '',
//   section1: section1,
//   section2: section2,
//   section3: section3
// };
// console.log('output', output);
// return output;
// };

const mapping = (
  data: any,
  //dataS: StandardData,
  //dataContinuum: ContinuumData,
  target: Target,
  observation: Observation
): SensCalcResults => {
  const output = getFinalResults(target, data, observation);

  // const output = {
  //   id: target.id,
  //   title: target.name,
  //   statusGUI: STATUS_OK,
  //   error: '',
  //   section1: [],
  //   section2: [],
  //   section3: []
  // };
  console.log('output', output);
  return output;
};

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

  const individualresults = getFinalIndividualResultsForContinuum(results, theObservation);

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

  console.log('[getContinuumData] getFinalResults theResults', theResults);

  return theResults;
}

// from calculateSensitivityCalculatorResults.ts
function getFinalIndividualResultsForContinuum(
  results: any,
  theObservation
): FinalIndividualResults {
  const isZoom = () => theObservation.type === TYPE_ZOOM;
  const isSuppliedSensitivity = () => theObservation.supplied.type === SUPPLIED_TYPE_SENSITIVITY;

  console.log('getContinuumData] getFinalIndividualResultsForContinuum results', results);

  let transformed_result = isZoom() ? results.transformed_result[0] : results.transformed_result; // ui only uses first result for zoom, for continuum transformed_result is an object

  console.log('transformed_result', transformed_result);

  const observationTypeLabel: string = OBS_TYPES[theObservation.type];
  const suppliedType = OBSERVATION.Supplied.find(sup => sup.value === theObservation.supplied.type)
    ?.sensCalcResultsLabel;

  // const results1 = {
  //   field: `${observationTypeLabel}SensitivityWeighted`,
  //   value: isZoom()
  //     ? results.spectralWeightedSensitivityDisplay?.value.toString()
  //     : results.weightedSensitivityDisplay?.value.toString(),
  //   units: results.weightedSensitivityDisplay?.unit
  // };

  const results1 = {
    field: `${observationTypeLabel}SensitivityWeighted`,
    value: isZoom()
      ? transformed_result.weighted_spectral_sensitivity?.value.toString()
      : transformed_result.weighted_continuum_sensitivity?.value.toString(), // not zoom - TODO: remove?
    units: isZoom()
      ? transformed_result.weighted_spectral_sensitivity?.unit
      : transformed_result.weighted_continuum_sensitivity?.unit
  };

  // const results2 = {
  //   field: `${observationTypeLabel}ConfusionNoise`,
  //   value: isZoom()
  //     ? results.spectralConfusionNoiseDisplay?.value.toString()
  //     : results.confusionNoiseDisplay?.value.toString(),
  //   units: results.confusionNoiseDisplay?.unit
  // };

  const results2 = {
    field: `${observationTypeLabel}ConfusionNoise`,
    value: isZoom()
      ? transformed_result.spectral_confusion_noise?.value.toString()
      : transformed_result.continuum_confusion_noise?.value.toString(), // not zoom - TODO: remove?
    units: isZoom()
      ? transformed_result.spectral_confusion_noise?.unit
      : transformed_result.continuum_confusion_noise?.unit
  };

  // const results3 = {
  //   field: `${observationTypeLabel}TotalSensitivity`,
  //   value: isZoom()
  //     ? results.spectralTotalSensitivityDisplay?.value.toString()
  //     : results.totalSensitivityDisplay?.value.toString(),
  //   units: results.totalSensitivityDisplay?.unit
  // };

  const results3 = {
    field: `${observationTypeLabel}TotalSensitivity`,
    value: isZoom()
      ? transformed_result.total_spectral_sensitivity?.value.toString()
      : transformed_result.total_continuum_sensitivity?.value.toString(),
    units: isZoom()
      ? transformed_result.total_spectral_sensitivity?.unit
      : transformed_result.total_continuum_sensitivity?.unit
  };

  // const results4 = {
  //   field: `${observationTypeLabel}SynthBeamSize`,
  //   value: results.beamSizeDisplay?.value,
  //   units: results.beamSizeDisplay?.unit
  // };

  const results4 = {
    field: `${observationTypeLabel}SynthBeamSize`,
    value: isZoom()
      ? transformed_result.spectral_synthesized_beam_size?.beam_maj.value.toString() +
        ' x ' +
        transformed_result.spectral_synthesized_beam_size?.beam_min.value.toString()
      : transformed_result.continuum_synthesized_beam_size?.beam_maj.value.toString() +
        ' x ' +
        transformed_result.continuum_synthesized_beam_size?.beam_min.value.toString(),
    units: isZoom()
      ? transformed_result.spectral_synthesized_beam_size?.beam_maj.unit // TODO: hard code arcsec2 for now or not?
      : transformed_result.continuum_synthesized_beam_size?.beam_maj.unit // TODO: hard code arcsec2 for now or not?
  };

  // const results5 = {
  //   field: isSuppliedSensitivity()
  //     ? `${observationTypeLabel}IntegrationTime`
  //     : `${observationTypeLabel}SurfaceBrightnessSensitivity`,
  //   value: isSuppliedSensitivity()
  //     ? results.continuumIntegrationTime?.value.toString()
  //     : results.sbs?.value.toString(),
  //   units: isSuppliedSensitivity() ? results.continuumIntegrationTime?.unit : results.sbs?.unit
  // };

  const results5 = {
    // low zoom only supports integration time hence return sensitivity
    field: isSuppliedSensitivity()
      ? `${observationTypeLabel}IntegrationTime`
      : `${observationTypeLabel}SurfaceBrightnessSensitivity`,
    value: isSuppliedSensitivity()
      ? results.continuumIntegrationTime?.value.toString() //TODO: revisit in mid
      : transformed_result[
          `${observationTypeLabel}_surface_brightness_sensitivity`
        ]?.value.toString(), // why it used to call sbs- ref const sbs = getSurfaceBrightnessSensitivity(
    units: isSuppliedSensitivity()
      ? results.continuumIntegrationTime?.unit //TODO: revisit in mid
      : transformed_result[`${observationTypeLabel}_surface_brightness_sensitivity`]?.unit
  };

  // const results6 = {
  //   field: 'spectralSensitivityWeighted',
  //   value: results.spectralWeightedSensitivityDisplay.value.toString(),
  //   units: results.spectralWeightedSensitivityDisplay.unit // TODO set correct unit when using supplied sensitivity
  // };

  const results6 = {
    field: 'spectralSensitivityWeighted',
    value: transformed_result.weighted_spectral_sensitivity.value.toString(), // TODO: revisit for diff between 1 and 6
    units: transformed_result.weighted_spectral_sensitivity.unit // TODO set correct unit when using supplied sensitivity
  };

  // const results7 = {
  //   field: 'spectralConfusionNoise',
  //   value: results.spectralConfusionNoiseDisplay?.value.toString(),
  //   units: results.spectralConfusionNoiseDisplay?.unit
  // };

  const results7 = {
    field: 'spectralConfusionNoise',
    value: transformed_result.spectral_confusion_noise?.value.toString(),
    units: transformed_result.spectral_confusion_noise?.unit
  };

  // const results8 = {
  //   field: 'spectralTotalSensitivity',
  //   value: results.spectralTotalSensitivityDisplay.value.toString(),
  //   units: results.spectralTotalSensitivityDisplay.unit
  // };

  const results8 = {
    field: 'spectralTotalSensitivity',
    value: transformed_result.total_spectral_sensitivity.value.toString(), // revisit for display diff to result3?
    units: transformed_result.total_spectral_sensitivity.unit
  };

  // const results9 = {
  //   field: 'spectralSynthBeamSize',
  //   value: results.spectralBeamSizeDisplay?.value,
  //   units: results.spectralBeamSizeDisplay?.unit
  // };

  const results9 = {
    //overlap 4?
    field: 'spectralSynthBeamSize',
    value:
      transformed_result.spectral_synthesized_beam_size?.beam_maj.value.toString() +
      ' x ' +
      transformed_result.spectral_synthesized_beam_size?.beam_min.value.toString(),
    units: transformed_result.spectral_synthesized_beam_size?.unit
  };

  // const results10 = {
  //   field: isSuppliedSensitivity()
  //     ? 'spectralIntegrationTime'
  //     : 'spectralSurfaceBrightnessSensitivity',
  //   value: isSuppliedSensitivity()
  //     ? results.spectralIntegrationTime?.value.toString()
  //     : results.spectralSbs?.value.toString(),
  //   units: isSuppliedSensitivity()
  //     ? results.spectralIntegrationTime?.unit
  //     : results.spectralSbs?.unit
  // };

  const results10 = {
    // overlap 5
    field: isSuppliedSensitivity() // zoom only supplied integration
      ? 'spectralIntegrationTime'
      : 'spectralSurfaceBrightnessSensitivity',
    value: isSuppliedSensitivity()
      ? results.spectralIntegrationTime?.value.toString()
      : transformed_result.spectral_surface_brightness_sensitivity?.value.toString(),
    units: isSuppliedSensitivity()
      ? results.spectralIntegrationTime?.unit
      : transformed_result.spectral_surface_brightness_sensitivity?.unit
  };

  const results11 = {
    field: suppliedType,
    value: theObservation.supplied.value.toString(),
    units: OBSERVATION.Supplied.find(s => s.sensCalcResultsLabel === suppliedType)?.units?.find(
      u => u.value === theObservation.supplied.units
    )?.label
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

  console.log('getFinalIndividualResultsForZoom updated_results', updated_results);

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
  if (subArrayResults && standardData.subarray !== OB_SUBARRAY_CUSTOM) {
    properties += subArrayLookup(standardData, subArrayResults);
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

declare const window: {
  env: {
    BACKEND_URL: string;
  };
} & Window;

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
