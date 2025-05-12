import Observation from 'utils/types/observation';
import Fetch from '../fetch/Fetch';
import Target from 'utils/types/target';
import { StandardData, SubArrayResults, Telescope, ZoomData } from 'utils/types/typesSensCalc';

/*
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
import {
  calculateSpectralResolution,
  getSpectralResolutionBaseValue
} from '../../../utils/calculate/calculate';
import { t } from 'i18next';



const getBandwidth = (num: number, isLow: boolean = true): number =>
  isLow ? BANDWIDTH_LOW_ZOOM[num - 1] : BANDWIDTH_MID_ZOOM[num - 1];

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

const addPropertiesLOW = (telescope: Telescope, standardData: StandardData, zoomData: ZoomData) => {
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
  properties += addValue(
    'spectral_resolutions_hz',
    getSpectralResolutionBaseValue(zoomData.bandwidth, false, isLow(telescope))
  );
  properties += addValue('total_bandwidths_khz', getBandwidth(zoomData.bandwidth.value));
  properties += addValue('weighting_mode', getImageWeightingMapping(zoomData.imageWeighting));
  properties = addRobustProperty(zoomData, properties);
  return properties;
};

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
  console.log('observation', observation);
  // TODO map zoomData and standardData with observation
  const zoomData: ZoomData = undefined;
  const standardData: StandardData = undefined;

  /*if (mocked) {
    return Promise.resolve(ZOOM_DATA_MOCKED);
  } else {
   */
  const URL_PATH = `/zoom/calculate`;
  /*
    let properties = isLow(telescope)
      ? addPropertiesLOW(telescope, standardData, zoomData)
      : addPropertiesMID(telescope, standardData, zoomData, subArrayResults);
    */
  let properties = '';
  /*
    if (showAdvanced && !isLow(telescope)) {
      properties += addAdvancedData(advancedData);
    }
      */
  const mapping: Function = undefined; // TODO uncomment mapping function
  return Fetch(
    telescope,
    URL_PATH,
    properties,
    mapping,
    standardData,
    zoomData,
    observation,
    target
  );
}
// }
export default getZoomData;
