import Observation from 'utils/types/observation';
import Fetch from '../fetch/Fetch';
import Target from 'utils/types/target';
import { ZOOM_DATA_MOCKED } from './mockedZoomResults';
import {
  StandardData,
  AdvancedData,
  ZoomData,
  SubArrayResults,
  Telescope
} from '../../../utils/types/typesSensCalc';
import {
  MOCKED_API,
  OB_SUBARRAY_CUSTOM,
  SEPARATOR0,
  STATUS_OK,
  TIME_HOURS,
  TIME_SECS,
  FREQUENCY_MHZ,
  FREQUENCY_HZ,
  WEIGHTING_CORRECTION_FACTOR_SINGLE_CHANNEL,
  FREQUENCY_KHZ,
  BANDWIDTH_LOW_ZOOM,
  BANDWIDTH_MID_ZOOM,
  DECIMAL_PLACES,
  STATUS_ERROR,
  RA_TYPE_GALACTIC,
  RA_TYPE_EQUATORIAL,
  IW_NATURAL
} from '../../../utils/constantsSensCalc';
import {
  isLow,
  getImageWeightingMapping,
  combineSensitivityAndWeightingFactor,
  getBeamSize,
  shiftSensitivity,
  frequencyConversion,
  getSensitivitiesUnitsMapping,
  isSuppliedSensitivity,
  isSuppliedTime
} from '../../../utils/helpersSensCalc';


import {
  pointingCentre,
  rxBand,
  subArrayLookup,
  addValue,
  addTime,
  addFrequency,
  addMapping,
  addMappingString,
  addWarningData,
  addRobustProperty,
  addMainData,
  addAdvancedData
} from '../submissionEntries/submissionEntries';
import { BANDWIDTH_TELESCOPE, FREQUENCY_UNITS, OBS_TYPES, OBSERVATION, SUPPLIED_TYPE_SENSITIVITY, TYPE_CONTINUUM, TYPE_ZOOM } from '../../../utils/constants';
import sensCalHelpers from '../../axios/sensitivityCalculator/sensCalHelpers';
import { ResultsSection, SensCalcResults } from 'utils/types/sensCalcResults';


// import {
//   calculateSpectralResolution,
//   getSpectralResolutionBaseValue
// } from '../../../utils/calculate/calculate';
// import { t } from 'i18next';




const getBandwidth = (num: number, isLow: boolean = true): number =>
{
  console.log('getBandwidth num ', num , 'isLow', isLow)
  return isLow ? BANDWIDTH_LOW_ZOOM[num - 1] : BANDWIDTH_MID_ZOOM[num - 1];
}
const mapping = (
  data: any,
  //dataS: StandardData,
  //dataContinuum: ContinuumData,
  target: Target,
  observation:Observation
): SensCalcResults => {

const output = getFinalResults(target, data, observation)

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


// from calculateSensitivityCalculatorResults.ts - TODO: put it somewhere shared
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


  const individualresults = getFinalIndividualResultsForZoom(results, theObservation);

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

  console.log('getFinalResults theResults', theResults)

  return theResults;
}

// from calculateSensitivityCalculatorResults.ts 
function getFinalIndividualResultsForZoom(results: any, theObservation): FinalIndividualResults {
  const isZoom = () => theObservation.type === TYPE_ZOOM;
  const isSuppliedSensitivity = () => theObservation.supplied.type === SUPPLIED_TYPE_SENSITIVITY;

  console.log('getFinalIndividualResultsForZoom results', results)

  let transformed_result = results.transformed_result[0] // ui only uses first result

  console.log('transformed_result', transformed_result)

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
      : results.weightedSensitivityDisplay?.value.toString(), // not zoom - TODO: remove?
    units: transformed_result.weighted_spectral_sensitivity?.unit
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
      : results.confusionNoiseDisplay?.value.toString(), // not zoom - TODO: remove?
    units: transformed_result.spectral_confusion_noise?.unit
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
      : results.totalSensitivityDisplay?.value.toString(),
    units: transformed_result.total_spectral_sensitivity?.unit // not zoom - TODO: remove?
  };

  // const results4 = {
  //   field: `${observationTypeLabel}SynthBeamSize`,
  //   value: results.beamSizeDisplay?.value,
  //   units: results.beamSizeDisplay?.unit
  // };


  const results4 = {
    field: `${observationTypeLabel}SynthBeamSize`,
    value: transformed_result.spectral_synthesized_beam_size?.beam_maj.value.toString() + ' x ' + transformed_result.spectral_synthesized_beam_size?.beam_min.value.toString(),
    units: transformed_result.spectral_synthesized_beam_size?.beam_maj.unit
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


  const results5 = { // low zoom only supports integration time hence return sensitivity
    field: isSuppliedSensitivity()
      ? `${observationTypeLabel}IntegrationTime` 
      : `${observationTypeLabel}SurfaceBrightnessSensitivity`, 
    value: isSuppliedSensitivity()
      ? results.continuumIntegrationTime?.value.toString() //TODO: remove?
      : transformed_result.spectral_surface_brightness_sensitivity?.value.toString(), // why it used to call sbs- ref const sbs = getSurfaceBrightnessSensitivity(
    units: isSuppliedSensitivity() ? results.continuumIntegrationTime?.unit : transformed_result.spectral_surface_brightness_sensitivity?.unit
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

  const results9 = { //overlap 4?
    field: 'spectralSynthBeamSize',
    value: transformed_result.spectral_synthesized_beam_size?.beam_maj.value.toString() + ' x ' + transformed_result.spectral_synthesized_beam_size?.beam_min.value.toString(),
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


  const results10 = { // overlap 5
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

  console.log('getFinalIndividualResultsForZoom updated_results', updated_results)

  return updated_results
}


/*
const mapping = (data: any, dataS: StandardData, dataZ: ZoomData) => {
  const isCustom = dataS.subarray === OB_SUBARRAY_CUSTOM;
  const isSensitivity = isSuppliedSensitivity(dataZ.suppliedType);
  const isNatural = dataZ.imageWeighting === IW_NATURAL;

  const cData = data?.calculate?.length ? data.calculate[0] : null;
  const wData = data?.transformed_result?.length ? data?.transformed_result[0] : null;

  let wFactor = 1;
  if (data) {
    if (data.weighting?.length) {
      wFactor = 'weighting_factor' in data?.weighting[0] ? data?.weighting[0]?.weighting_factor : 1;
    } else {
      if (data?.weighting) {
        if (data?.weighting?.spectral_weighting?.length) {
          wFactor =
            'weighting_factor' in data?.weighting.spectral_weighting[0]
              ? data?.weighting.spectral_weighting[0]?.weighting_factor
              : 1;
        }
      }
    }
  }

  const results: any[] = [];

  let calc = { value: 0, unit: '' };
  if (!isSensitivity) {
    calc =
      typeof wData?.weighted_spectral_sensitivity === 'object'
        ? shiftSensitivity(wData?.weighted_spectral_sensitivity)
        : { value: 0, unit: '' };
    addMainData(
      results,
      'spectralSensitivity',
      wData?.weighted_spectral_sensitivity,
      addMappingString(
        'spectralSensitivity',
        combineSensitivityAndWeightingFactor(
          calc,
          wFactor,
          WEIGHTING_CORRECTION_FACTOR_SINGLE_CHANNEL
        )
      ),
      isCustom
    );
  }

  calc =
    typeof wData?.spectral_confusion_noise === 'object'
      ? shiftSensitivity(wData.spectral_confusion_noise)
      : { value: 0, unit: '' };
  addMainData(
    results,
    'spectralConfusionNoise',
    wData?.spectral_confusion_noise,
    addMapping('spectralConfusionNoise', calc),
    isCustom
  );

  if (!isSensitivity) {
    calc =
      typeof wData?.total_spectral_sensitivity === 'object'
        ? shiftSensitivity(wData.total_spectral_sensitivity)
        : { value: 0, unit: '' };
    addMainData(
      results,
      'spectralTotalSensitivity',
      wData?.total_spectral_sensitivity,
      addMapping('spectralTotalSensitivity', calc),
      isCustom
    );
  }

  addMainData(
    results,
    'spectralSynthBeamSize',
    wData?.spectral_synthesized_beam_size,
    addMappingString(
      'spectralSynthBeamSize',
      getBeamSize(wData?.spectral_synthesized_beam_size, DECIMAL_PLACES)
    ),
    isCustom
  );

  if (isSensitivity) {
    addMainData(
      results,
      'spectralIntegrationTime',
      wData?.spectral_integration_time,
      addMapping('spectralIntegrationTime', wData?.spectral_integration_time),
      isCustom
    );
  } else {
    addMainData(
      results,
      'spectralSurfaceBrightnessSensitivity',
      wData?.spectral_surface_brightness_sensitivity,
      addMapping(
        'spectralSurfaceBrightnessSensitivity',
        wData?.spectral_surface_brightness_sensitivity
      ),
      isCustom
    );
  }

  if (cData?.spectropolarimetry_results) {
    results.push(addMapping('fwhmOfTheRmsf', cData?.spectropolarimetry_results.fwhm_of_the_rmsf));
    results.push(
      addMapping(
        'maxFaradayDepthExtent',
        cData?.spectropolarimetry_results.max_faraday_depth_extent
      )
    );
    results.push(
      addMapping('maxFaradayDepth', cData?.spectropolarimetry_results.max_faraday_depth)
    );
  }
  if (isCustom) {
    addWarningData([t('customWarning.warning')], results, 'warningCustom');
  }
  if (isNatural) {
    addWarningData([t('noEstimateWarning.warning')], results, 'warningNoEstimate');
  }
  if (cData?.warnings?.length > 0) {
    const arr = cData?.warnings[0].split('Error:');
    if (arr.length === 1) {
      addWarningData(cData?.warnings, results);
    } else {
      return {
        id: 1,
        statusGUI: STATUS_ERROR,
        error: cData?.warnings[0],
        results: null
      };
    }
  }

  return {
    id: 1,
    statusGUI: STATUS_OK,
    error: '',
    results: results
  };
};



*/



const addPropertiesLOW = (telescope: Telescope, standardData: StandardData, zoomData: ZoomData, observation:Observation) => {

  const getBandwidthValues = () =>
    OBSERVATION.array.find(item => item.value === observation.telescope).bandWidth;
  
  function getZoomBandwidthValueUnit() {
    const bandWidthValue = getBandwidthValues()?.find(item => item.value === observation?.bandwidth)
      ?.label;
    return bandWidthValue?.split(' ');
  }

  const getSpectralResolution = () => {
      const units = FREQUENCY_UNITS[2].label;
      const spectralResValue = observation.spectralResolution.includes(units)
        ? Number(observation.spectralResolution.split(' ')[0]) * 1000
        : Number(observation.spectralResolution.split(' ')[0]);
      return spectralResValue?.toString();
    };

  console.log('addPropertiesLOW')
  const bandwidthValueUnit: string[] = getZoomBandwidthValueUnit();
  let properties = '';
  if (standardData.subarray !== OB_SUBARRAY_CUSTOM) {
    properties += addValue('subarray_configuration', standardData.subarray, SEPARATOR0);
  } else {
    properties += addValue('num_stations', standardData.numStations, SEPARATOR0);
  }
  if (isSuppliedTime(zoomData.suppliedType)) {
    properties += addTime('integration_time_h', zoomData.supplied_0, TIME_HOURS);
  } else {
    properties += addValue('sensitivity_jy', zoomData.supplied_1.value);
  }
  properties += pointingCentre(standardData);
  properties += addValue('elevation_limit', standardData.elevation.value);
  properties += addFrequency('freq_centres_mhz', zoomData.centralFrequency, FREQUENCY_MHZ);
  properties += addValue('spectral_averaging_factor', zoomData.spectralAveraging);

  //TODO: where to get getSpectralResolutionBaseValue
  // properties += addValue(
  //   'spectral_resolutions_hz',
  //   getSpectralResolutionBaseValue(zoomData.bandwidth, false, isLow(telescope))
  // );

  //use old method for now
  properties += addValue(
    'spectral_resolutions_hz',
    getSpectralResolution()
  );

  properties += addValue('total_bandwidths_khz', sensCalHelpers.format.convertBandwidthToKHz(
    bandwidthValueUnit[0],
    bandwidthValueUnit[1]
  )) //from old method,  low zoom bandwidth should be sent in kHz);
  properties += addValue('weighting_mode', getImageWeightingMapping(zoomData.imageWeighting));
  properties = addRobustProperty(zoomData, properties);

  console.log('addPropertiesLOW properties', properties)

  return properties;
  
};

/* REF old method

const getBandwidthValues = () =>
    OBSERVATION.array.find(item => item.value === observation.telescope).bandWidth;

function getZoomBandwidthValueUnit() {
    const bandWidthValue = getBandwidthValues()?.find(item => item.value === observation?.bandwidth)
      ?.label;
    return bandWidthValue?.split(' ');
  }


const getParamZoomLow = (): CalculateLowZoomQuery => {
    const bandwidthValueUnit: string[] = getZoomBandwidthValueUnit();
    const params = {
      integration_time_h: Number(observation.supplied.value),
      pointing_centre: rightAscension() + ' ' + declination(),
      elevation_limit: observation.elevation?.toString(),
      freq_centres_mhz: observation.centralFrequency.toString(),
      spectral_averaging_factor: observation.spectralAveraging,
      spectral_resolutions_hz: getSpectralResolution(),
      total_bandwidths_khz: sensCalHelpers.format.convertBandwidthToKHz(
        bandwidthValueUnit[0],
        bandwidthValueUnit[1]
      ) // low zoom bandwidth should be sent in kHz
    };
    const subArrayOrAntennasParams = getLowSubArrayOrAntennasParams();
    return { ...params, ...subArrayOrAntennasParams };
  };

  */

/*

const addPropertiesMID = (
  telescope: Telescope,
  standardData: StandardData,
  zoomData: ZoomData,
  subArrayResults: SubArrayResults | undefined
) => {
  let properties = '';

  properties += rxBand(standardData.observingBand, SEPARATOR0);
  if (subArrayResults && standardData.subarray !== OB_SUBARRAY_CUSTOM) {
    properties += subArrayLookup(standardData, subArrayResults);
  } else {
    properties += addValue('n_ska', standardData.num15mAntennas);
    properties += addValue('n_meer', standardData.num13mAntennas);
  }
  properties += addFrequency('freq_centres_hz', zoomData.centralFrequency, FREQUENCY_HZ);
  properties += pointingCentre(standardData);
  properties += addValue('pmv', standardData.weather.value);
  properties += addValue('el', standardData.elevation.value);
  const specResolutionDisplay = calculateSpectralResolution(
    zoomData.bandwidth,
    false,
    zoomData.centralFrequency,
    isLow(telescope)
  );
  const specResolutionArr = specResolutionDisplay.split(' ');
  const specResolutionHz = frequencyConversion(specResolutionArr[0], FREQUENCY_KHZ);
  properties += addValue('spectral_resolutions_hz', specResolutionHz);
  properties += addValue(
    'total_bandwidths_hz',
    frequencyConversion(getBandwidth(zoomData.bandwidth.value, false), FREQUENCY_MHZ, FREQUENCY_HZ)
  );
  if (isSuppliedTime(zoomData.suppliedType)) {
    properties += addTime('integration_time_s', zoomData.supplied_0, TIME_SECS);
  } else {
    properties += addValue('supplied_sensitivities', zoomData.supplied_1.value);
    properties += addValue(
      'sensitivity_unit',
      getSensitivitiesUnitsMapping(Number(zoomData.supplied_1.unit))
    );
  }
  properties += addValue('weighting_mode', getImageWeightingMapping(zoomData.imageWeighting));
  properties = addRobustProperty(zoomData, properties);
  properties += addValue('taper', zoomData.tapering);
  // TODO : Add advanced
  return properties;
};

*/

async function getZoomData(
  telescope: Telescope,
  subArrayResults: SubArrayResults | undefined,
  // advancedData: AdvancedData,
  observation: Observation,
  target: Target
  // showAdvanced: boolean,
  // mocked = MOCKED_API
) {
  // export const NEW_ZOOM_DATA_LOW: ZoomData = {
  //   dataType: TYPE_ZOOM,
  //   bandwidth: { value: 1, unit: '2' },
  //   suppliedType: 0,
  //   supplied_0: DEFAULT_LOW_SUPPLIED_INTEGRATION_TIME,
  //   supplied_1: DEFAULT_LOW_SUPPLIED_SENSITIVITY,
  //   centralFrequency: { value: 200, unit: '2' },
  //   spectralAveraging: 1,
  //   spectralResolution: '',
  //   imageWeighting: 1,
  //   robust: 3,
  //   tapering: 0
  // };
  console.log('[getZoomData] observation', observation);

  // TODO map zoomData and standardData with observation
  //const zoomData: ZoomData = undefined;
  //const standardData: StandardData = undefined;

  const zoomData: ZoomData = {
      dataType: observation.type,
      bandwidth: {
        value: observation?.continuumBandwidth,
        unit: observation?.continuumBandwidthUnits.toString()
      },
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
      spectralAveraging: observation?.spectralAveraging,
      spectralResolution: '',
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
      advancedData: undefined, // no advanced data(?) in pht
      modules: []
    };



  /*if (mocked) {
    return Promise.resolve(ZOOM_DATA_MOCKED);
  } else {
   */
  const URL_PATH = `/zoom/calculate`;
  
  let properties = isLow(telescope)
      ? addPropertiesLOW(telescope, standardData, zoomData, observation)
      : 'not low'
      //: addPropertiesMID(telescope, standardData, zoomData, subArrayResults);
    
  //let properties = '';
  /*
    if (showAdvanced && !isLow(telescope)) {
      properties += addAdvancedData(advancedData);
    }
      */

  console.log('properties', properties)
  // const mapping: Function = undefined; // TODO uncomment mapping function
  return Fetch(telescope, URL_PATH, properties, mapping, standardData, zoomData, target, observation);
}
// }
export default getZoomData;
