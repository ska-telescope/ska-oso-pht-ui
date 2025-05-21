import Observation from 'utils/types/observation';
import Fetch from '../fetch/Fetch';
import Target from 'utils/types/target';
import {
  StandardData,
  ZoomData,
  SubArrayResults,
  Telescope
} from '../../../utils/types/typesSensCalc';
import {
  OB_SUBARRAY_CUSTOM,
  SEPARATOR0,
  STATUS_OK,
  TIME_HOURS,
  FREQUENCY_MHZ,
  DECIMAL_PLACES,
  RA_TYPE_GALACTIC,
  RA_TYPE_EQUATORIAL
} from '../../../utils/constantsSensCalc';
import {
  isLow,
  getImageWeightingMapping,
  shiftSensitivity,
  isSuppliedTime
} from '../../../utils/helpersSensCalc';

import {
  pointingCentre,
  addValue,
  addTime,
  addFrequency,
  addRobustProperty
} from '../submissionEntries/submissionEntries';
import {
  BANDWIDTH_TELESCOPE,
  FREQUENCY_UNITS,
  OBS_TYPES,
  OBSERVATION,
  SUPPLIED_TYPE_SENSITIVITY,
  TYPE_CONTINUUM
} from '../../../utils/constants';
import sensCalHelpers from '../../axios/sensitivityCalculator/sensCalHelpers';
import { ResultsSection, SensCalcResults } from '../../../utils/types/sensCalcResults';
import { presentUnits } from '../../../utils/present';

const mapping = (data: any, target: Target, observation: Observation): SensCalcResults =>
  getFinalResults(target, data, observation);
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

function getFinalResults(target, results: any, theObservation): SensCalcResults {
  const isSuppliedSensitivity = () => theObservation.supplied.type === SUPPLIED_TYPE_SENSITIVITY;
  const isContinuum = () => theObservation.type === TYPE_CONTINUUM;

  const individualResults = getFinalIndividualResultsForZoom(results, theObservation);

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

  if (!isSuppliedSensitivity()) {
    theResults.section1.push(individualResults.results1);
  }
  theResults.section1.push(individualResults.results2);
  if (!isSuppliedSensitivity()) {
    theResults.section1.push(individualResults.results3);
  }
  theResults.section1.push(individualResults.results4);
  theResults.section1.push(individualResults.results5);

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

  return theResults;
}

const toFixed = (value: number) => {
  if (value === undefined || value === null) {
    return 0;
  }
  return Number(value).toFixed(DECIMAL_PLACES);
};

function getFinalIndividualResultsForZoom(results: any, theObservation): FinalIndividualResults {
  const isSuppliedSensitivity = () => theObservation.supplied.type === SUPPLIED_TYPE_SENSITIVITY;

  let transformed_result = results.transformed_result[0]; // ui only uses first result

  const observationTypeLabel: string = OBS_TYPES[theObservation.type];
  const suppliedType = OBSERVATION.Supplied.find(sup => sup.value === theObservation.supplied.type)
    ?.sensCalcResultsLabel;

  const shifted1 = shiftSensitivity(transformed_result?.weighted_continuum_sensitivity);
  const results1 = {
    field: `${observationTypeLabel}SensitivityWeighted`,
    value: shifted1.value.toString(), // not zoom - TODO: remove?
    units: shifted1.unit
  };

  const shifted2 = shiftSensitivity(transformed_result?.continuum_confusion_noise);
  const results2 = {
    field: `${observationTypeLabel}ConfusionNoise`,
    value: shifted2.value.toString(),
    units: shifted2.unit
  };

  const shifted3 = shiftSensitivity(transformed_result?.total_continuum_sensitivity);
  const results3 = {
    field: `${observationTypeLabel}TotalSensitivity`,
    value: shifted3.value.toString(),
    units: shifted3.unit
  };

  const results4 = {
    field: `${observationTypeLabel}SynthBeamSize`,
    value:
      toFixed(transformed_result?.continuum_synthesized_beam_size?.beam_maj.value).toString() +
      ' x ' +
      toFixed(transformed_result?.continuum_synthesized_beam_size?.beam_min.value).toString(),
    units: presentUnits('arcsec2')
  };

  const results5 = {
    field: isSuppliedSensitivity()
      ? `${observationTypeLabel}IntegrationTime`
      : `${observationTypeLabel}SurfaceBrightnessSensitivity`,
    value: isSuppliedSensitivity()
      ? transformed_result?.continuum_integration_time?.value.toString()
      : transformed_result?.continuum_surface_brightness_sensitivity?.value.toString(),
    units: isSuppliedSensitivity()
      ? transformed_result?.continuum_integration_time?.unit
      : transformed_result?.continuum_surface_brightness_sensitivity?.unit
  };

  const shifted6 = shiftSensitivity(transformed_result?.weighted_spectral_sensitivity);
  const results6 = {
    field: 'spectralSensitivityWeighted',
    value: shifted6.value?.toString(),
    units: shifted6.unit
  };

  const shifted7 = shiftSensitivity(transformed_result?.spectral_confusion_noise);
  const results7 = {
    field: 'spectralConfusionNoise',
    value: shifted7.value?.toString(),
    units: shifted7.unit
  };

  const shifted8 = shiftSensitivity(transformed_result?.total_spectral_sensitivity);
  const results8 = {
    field: 'spectralTotalSensitivity',
    value: shifted8.value?.toString(),
    units: shifted8.unit
  };

  const results9 = {
    field: 'spectralSynthBeamSize',
    value:
      toFixed(transformed_result?.spectral_synthesized_beam_size?.beam_maj.value).toString() +
      ' x ' +
      toFixed(transformed_result?.spectral_synthesized_beam_size?.beam_min.value).toString(),
    units: presentUnits('arcsec2')
  };

  const results10 = {
    field: isSuppliedSensitivity()
      ? 'spectralIntegrationTime'
      : 'spectralSurfaceBrightnessSensitivity',
    value: isSuppliedSensitivity()
      ? transformed_result?.spectral_integration_time?.value?.toString()
      : transformed_result?.spectral_surface_brightness_sensitivity?.value?.toString(),
    units: isSuppliedSensitivity()
      ? transformed_result?.spectral_integration_time?.unit ?? 'ERR10a'
      : transformed_result?.spectral_surface_brightness_sensitivity?.unit ?? 'ERR10b'
  };

  const results11 = {
    field: suppliedType,
    value: theObservation?.supplied?.value?.toString(),
    units:
      OBSERVATION.Supplied.find(s => s.sensCalcResultsLabel === suppliedType)?.units?.find(
        u => u.value === theObservation.supplied.units
      )?.label ?? ''
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

  return updated_results;
}

const addPropertiesLOW = (
  telescope: Telescope,
  standardData: StandardData,
  zoomData: ZoomData,
  observation: Observation
) => {
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
  properties += addValue('spectral_resolutions_hz', getSpectralResolution());

  properties += addValue(
    'total_bandwidths_khz',
    sensCalHelpers.format.convertBandwidthToKHz(bandwidthValueUnit[0], bandwidthValueUnit[1])
  ); //from old method,  low zoom bandwidth should be sent in kHz);
  properties += addValue('weighting_mode', getImageWeightingMapping(zoomData.imageWeighting));
  properties = addRobustProperty(zoomData, properties);

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
    : 'not low';
  //: addPropertiesMID(telescope, standardData, zoomData, subArrayResults);

  //let properties = '';
  /*
    if (showAdvanced && !isLow(telescope)) {
      properties += addAdvancedData(advancedData);
    }
      */

  // const mapping: Function = undefined; // TODO uncomment mapping function
  return Fetch(
    telescope,
    URL_PATH,
    properties,
    mapping,
    standardData,
    zoomData,
    target,
    observation
  );
}
export default getZoomData;
