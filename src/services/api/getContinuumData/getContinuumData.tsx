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
import Observation from 'utils/types/observation';
import Fetch from '../fetch/Fetch';
import { BANDWIDTH_TELESCOPE, OBSERVATION, TYPE_CONTINUUM } from '../../../utils/constants';
import Target from 'utils/types/target';
import { t } from 'i18next';
import { SensCalcResults, ResultsSection } from 'utils/types/sensCalcResults';
import { ContactlessOutlined } from '@mui/icons-material';
import { forEach } from 'cypress/types/lodash';

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

export const mapping = (
  data: any,
  dataS: StandardData,
  dataContinuum: ContinuumData,
  observation: Observation,
  target: Target
): SensCalcResults => {
  const isCustom = dataS.subarray === OB_SUBARRAY_CUSTOM;
  const cData = findCData(data);

  const isNatural = dataContinuum.imageWeighting === IW_NATURAL;

  if (cData?.warnings?.length) {
    // return {
    //   id: 1,
    //   statusGUI: STATUS_ERROR,
    //   error: '',
    //   results: cData?.warnings
    // };
    return {
      id: target.id,
      title: target.name,
      statusGUI: STATUS_ERROR,
      error: '',
      section1: cData?.warnings,
      section2: cData?.warnings,
      section3: cData?.warnings
      // TODO we probably want warnings in 1 section instead of repeating them?
    };
  }

  const wData = findWData(data);

  const results: any[] = [];
  const section1: ResultsSection[] = [];
  const section2: ResultsSection[] = [];
  const section3: ResultsSection[] = [];

  if (wData) {
    if ('weighted_continuum_sensitivity' in wData) {
      section1.push(
        addMappingString(
          'continuumSensitivityWeighted',
          combineSensitivityAndWeightingFactor(
            shiftSensitivity(wData?.weighted_continuum_sensitivity),
            findWeightingFactorContinuum(data),
            WEIGHTING_CORRECTION_FACTOR_30_PERCENT_BANDWIDTH
          )
        )
      );
    }
    if ('continuum_confusion_noise' in wData) {
      addMainData(
        section1,
        'continuumConfusionNoise',
        wData?.continuum_confusion_noise,
        addMapping('continuumConfusionNoise', shiftSensitivity(wData?.continuum_confusion_noise)),
        isCustom
      );
    }
    if ('total_continuum_sensitivity' in wData) {
      addMainData(
        section1,
        'continuumSensitivity',
        wData?.total_continuum_sensitivity,
        addMapping('continuumSensitivity', shiftSensitivity(wData?.total_continuum_sensitivity)),
        isCustom
      );
    }
    if ('continuum_synthesized_beam_size' in wData) {
      addMainData(
        section1,
        'continuumSynthBeamSize',
        wData?.continuum_synthesized_beam_size,
        addMappingString(
          'continuumSynthBeamSize',
          getBeamSize(wData?.continuum_synthesized_beam_size, DECIMAL_PLACES)
        ),
        isCustom
      );
    }
    if ('continuum_surface_brightness_sensitivity' in wData) {
      addMainData(
        section1,
        'continuumSurfaceBrightnessSensitivity',
        wData?.continuum_surface_brightness_sensitivity,
        addMapping(
          'continuumSurfaceBrightnessSensitivity',
          shiftSensitivityK(wData?.continuum_surface_brightness_sensitivity)
        ),
        isCustom
      );
    }

    if ('continuum_integration_time' in wData) {
      section1.push(
        addMapping('continuumIntegrationTime', shiftTime(wData?.continuum_integration_time, true))
      );
    }
    addSubBandResultData(data, results);

    if ('weighted_spectral_sensitivity' in wData) {
      section1.push(mappingSpectralSensitivity(data));
    }

    if ('spectral_confusion_noise' in wData) {
      addMainData(
        section2,
        'spectralConfusionNoise',
        wData?.spectral_confusion_noise,
        addMapping('spectralConfusionNoise', shiftSensitivity(wData?.spectral_confusion_noise)),
        isCustom
      );
    }

    if ('total_spectral_sensitivity' in wData) {
      addMainData(
        section2,
        'spectralTotalSensitivity',
        wData?.total_spectral_sensitivity,
        addMapping('spectralTotalSensitivity', shiftSensitivity(wData?.total_spectral_sensitivity)),
        isCustom
      );
    }

    if ('spectral_synthesized_beam_size' in wData) {
      addMainData(
        section2,
        'spectralSynthBeamSize',
        wData?.spectral_synthesized_beam_size,
        addMappingString(
          'spectralSynthBeamSize',
          getBeamSize(wData?.spectral_synthesized_beam_size, DECIMAL_PLACES)
        ),
        isCustom
      );
    }

    if ('spectral_surface_brightness_sensitivity' in wData) {
      addMainData(
        section2,
        'spectralSurfaceBrightnessSensitivity',
        wData?.spectral_surface_brightness_sensitivity,
        addMapping(
          'spectralSurfaceBrightnessSensitivity',
          shiftSensitivityK(wData?.spectral_surface_brightness_sensitivity)
        ),
        isCustom
      );
    }
    if ('spectral_integration_time' in wData) {
      section2.push(
        addMapping('spectralIntegrationTime', shiftTime(wData?.spectral_integration_time, true))
      );
    }
  }

  if (cData.spectropolarimetry_results) {
    if ('fwhm_of_the_rmsf' in cData.spectropolarimetry_results) {
      section3.push(
        addMapping('fwhmOfTheRmsf', cData?.spectropolarimetry_results.fwhm_of_the_rmsf)
      );
    }

    if ('max_faraday_depth_extent' in cData.spectropolarimetry_results) {
      section3.push(
        addMapping(
          'maxFaradayDepthExtent',
          cData?.spectropolarimetry_results.max_faraday_depth_extent
        )
      );
    }

    if ('max_faraday_depth' in cData.spectropolarimetry_results) {
      section3.push(
        addMapping('maxFaradayDepth', cData?.spectropolarimetry_results.max_faraday_depth)
      );
    }
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

  const output = {
    id: target.id,
    title: target.name,
    statusGUI: STATUS_OK,
    error: '',
    section1: section1,
    ...(observation.type === TYPE_CONTINUUM && {
      section2: section2
    }),
    section3: section3
  };
  console.log('output', output);
  return output;
};

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
    observation,
    target
  );
  return response;
}
export default getContinuumData;
