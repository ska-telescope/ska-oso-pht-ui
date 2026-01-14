import Observation from '@utils/types/observation';
import Target from '@utils/types/target';
import { presentUnits } from '@utils/present/present';
import { StandardData, ZoomData, Telescope } from '@utils/types/typesSensCalc.tsx';
import {
  SA_CUSTOM,
  SEPARATOR0,
  STATUS_OK,
  TIME_HOURS,
  FREQUENCY_MHZ,
  DECIMAL_PLACES,
  RA_TYPE_GALACTIC,
  RA_TYPE_ICRS,
  TIME_SECS,
  TAPER_DEFAULT,
  ROBUST_DEFAULT,
  IW_UNIFORM
} from '@utils/constants';
import {
  isLow,
  getImageWeightingMapping,
  shiftSensitivity,
  isSuppliedTime,
  getSensitivitiesUnitsMapping
} from '@utils/helpersSensCalc.ts';
import { FREQUENCY_HZ, FREQUENCY_UNITS, SUPPLIED_TYPE_SENSITIVITY } from '@utils/constants.ts';
import { ResultsSection, SensCalcResults } from '@utils/types/sensCalcResults.tsx';
import { OSD_CONSTANTS } from '@utils/OSDConstants.ts';
import {
  pointingCentre,
  addValue,
  addTime,
  addFrequency,
  addRobustProperty,
  rxBand
} from '../submissionEntries/submissionEntries';
import sensCalHelpers from '../sensitivityCalculator/sensCalHelpers';
import Fetch from '../fetch/Fetch';
import axiosClient from '@/services/axios/axiosClient/axiosClient';
import { DataProductSDPNew, SDPSpectralData } from '@/utils/types/dataProduct';

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

export function getFinalResults(
  target: Target,
  results: any,
  theObservation: Observation
): SensCalcResults {
  const isSuppliedSensitivity = () => theObservation.supplied.type === SUPPLIED_TYPE_SENSITIVITY;

  const individualResults = getFinalIndividualResultsForZoom(results, theObservation);

  const theResults: SensCalcResults = {
    id: target.id,
    title: target.name,
    statusGUI: STATUS_OK,
    section1: [],
    section3: [individualResults.results11]
  };

  if (!isSuppliedSensitivity()) {
    theResults.section1?.push(individualResults.results6);
  }
  theResults.section1?.push(individualResults.results7);
  if (!isSuppliedSensitivity()) {
    theResults.section1?.push(individualResults.results8);
  }
  theResults.section1?.push(individualResults.results9);
  theResults.section1?.push(individualResults.results10);

  return theResults;
}

const toFixed = (value: number) => {
  if (value === undefined || value === null) {
    return 0;
  }
  return Number(value).toFixed(DECIMAL_PLACES);
};

export function getFinalIndividualResultsForZoom(
  results: any,
  theObservation: any
): FinalIndividualResults {
  const isSuppliedSensitivity = () => theObservation.supplied.type === SUPPLIED_TYPE_SENSITIVITY;

  let transformed_result = results.transformed_result[0]; // ui only uses first result

  const suppliedType = OSD_CONSTANTS.Supplied.find(
    sup => sup.value === theObservation.supplied.type
  )?.sensCalcResultsLabel;

  const shifted1 = shiftSensitivity(transformed_result?.weighted_continuum_sensitivity);
  const results1 = {
    field: `continuumSensitivityWeighted`,
    value: shifted1.value.toString(), // not zoom - TODO: remove?
    units: shifted1.unit
  };

  const shifted2 = shiftSensitivity(transformed_result?.continuum_confusion_noise);
  const results2 = {
    field: `continuumConfusionNoise`,
    value: shifted2.value.toString(),
    units: shifted2.unit
  };

  const shifted3 = shiftSensitivity(transformed_result?.total_continuum_sensitivity);
  const results3 = {
    field: `continuumTotalSensitivity`,
    value: shifted3.value.toString(),
    units: shifted3.unit
  };

  const results4 = {
    field: `continuumSynthBeamSize`,
    value:
      toFixed(transformed_result?.continuum_synthesized_beam_size?.beam_maj.value).toString() +
      ' x ' +
      toFixed(transformed_result?.continuum_synthesized_beam_size?.beam_min.value).toString(),
    units: presentUnits('arcsec2')
  };

  const results5 = {
    field: isSuppliedSensitivity()
      ? `continuumIntegrationTime`
      : `continuumSurfaceBrightnessSensitivity`,
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
      OSD_CONSTANTS.Supplied.find(s => s.sensCalcResultsLabel === suppliedType)?.units?.find(
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
  return updated_results as FinalIndividualResults;
}

const getSpectralResolution = (observation: Observation) => {
  const units = FREQUENCY_UNITS[2].label;
  const spectralResValue = observation.spectralResolution.includes(units)
    ? Number(observation.spectralResolution.split(' ')[0]) * 1000
    : Number(observation.spectralResolution.split(' ')[0]);
  return spectralResValue?.toString();
};

const defaultToOne = (value: unknown): number => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : 1;
};

const addPropertiesLOW = (
  standardData: StandardData,
  zoomData: ZoomData,
  observation: Observation
) => {
  const getBandwidthValues = () =>
    OSD_CONSTANTS.array?.find(item => item.value === observation.telescope)?.bandWidth;

  function getZoomBandwidthValueUnit() {
    const bandWidthValue = getBandwidthValues()?.find(item => item.value === observation?.bandwidth)
      ?.label;
    return bandWidthValue?.split(' ');
  }

  const bandwidthValueUnit: string[] = getZoomBandwidthValueUnit() ?? [];
  let properties = '';
  if (standardData.subarray !== SA_CUSTOM) {
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
  properties += addValue('spectral_averaging_factor', defaultToOne(zoomData.spectralAveraging));

  properties += addValue('spectral_resolutions_hz', getSpectralResolution(observation));

  properties += addValue(
    'total_bandwidths_khz',
    sensCalHelpers.format.convertBandwidthToKHz(
      Number(bandwidthValueUnit[0]),
      bandwidthValueUnit[1]
    )
  );
  properties += addValue('weighting_mode', getImageWeightingMapping(zoomData.imageWeighting));
  properties = addRobustProperty(zoomData, properties);

  return properties;
};

const addPropertiesMID = (
  standardData: StandardData,
  zoomData: ZoomData,
  observation: Observation
) => {
  const getBandwidthValues = () =>
    OSD_CONSTANTS.array.find(item => item.value === observation.telescope)?.bandWidth;

  function getZoomBandwidthValueUnit() {
    const bandWidthValue = getBandwidthValues()?.find(item => item.value === observation?.bandwidth)
      ?.label;
    return bandWidthValue?.split(' ');
  }

  const bandwidthValueUnit: string[] = getZoomBandwidthValueUnit() ?? [];

  let properties = '';
  if (isSuppliedTime(zoomData.suppliedType)) {
    properties += addTime('integration_time_s', zoomData.supplied_0, TIME_SECS, SEPARATOR0);
  } else {
    properties += addValue('supplied_sensitivity', zoomData.supplied_1.value, SEPARATOR0);
    properties += addValue(
      'sensitivity_unit',
      getSensitivitiesUnitsMapping(Number(zoomData.supplied_1.unit))
    );
  }
  properties += rxBand(standardData.observingBand);

  if (standardData.subarray !== SA_CUSTOM) {
    properties += addValue('subarray_configuration', standardData.subarray);
  } else {
    properties += addValue('n_ska', standardData.num15mAntennas);
    properties += addValue('n_meer', standardData.num13mAntennas);
  }
  properties += addFrequency('freq_centres_hz', zoomData.centralFrequency, FREQUENCY_HZ);
  // properties += addFrequency('bandwidth_hz', zoomData.bandwidth, FREQUENCY_HZ);
  properties += addValue('spectral_averaging_factor', defaultToOne(zoomData.spectralAveraging));
  properties += addValue('spectral_resolutions_hz', getSpectralResolution(observation));
  properties += pointingCentre(standardData);
  properties += addValue('pmv', Number(standardData.weather.value));
  properties += addValue('el', Number(standardData.elevation.value));
  properties += addValue(
    'total_bandwidths_hz',
    sensCalHelpers.format.convertBandwidthToHz(Number(bandwidthValueUnit[0]), bandwidthValueUnit[1])
  );
  properties += addValue('weighting_mode', getImageWeightingMapping(zoomData.imageWeighting));
  properties += addValue('taper', zoomData.tapering);
  properties = addRobustProperty(zoomData, properties);
  return properties;
};

async function GetZoomData(
  telescope: Telescope,
  observation: Observation,
  target: Target,
  dataProductSDP: DataProductSDPNew
) {
  const zoomData: ZoomData = {
    dataType: observation.type,
    bandwidth: {
      value: 0, //observation?.continuumBandwidth,
      unit: '' // observation?.continuumBandwidthUnits.toString()
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
    spectralAveraging: observation?.spectralAveraging ?? 0,
    spectralResolution: '',
    imageWeighting: (dataProductSDP?.data as SDPSpectralData)?.weighting ?? IW_UNIFORM,
    robust: (dataProductSDP?.data as SDPSpectralData)?.robust ?? ROBUST_DEFAULT,
    tapering: (dataProductSDP?.data as SDPSpectralData)?.taperValue ?? TAPER_DEFAULT
  };

  const observingBand = (observation: Observation) => observation.observingBand;

  // TODO handle custom subarray
  const subArray = (observation: Observation) => {
    const result = OSD_CONSTANTS.array
      .find(t => t.value === observation.telescope)
      ?.subarray?.find(s => s.value === observation.subarray);
    return result ? result.map : '';
  };

  const standardData: StandardData = {
    observingBand: observingBand(observation),
    weather: { value: observation.weather ?? 0, unit: 'mm' },
    subarray: subArray(observation),
    num15mAntennas: observation.num15mAntennas ?? 0,
    num13mAntennas: observation.num13mAntennas ?? 0,
    numStations: observation.numStations ?? 0,
    skyDirectionType: RA_TYPE_GALACTIC,
    raGalactic: { value: target.raStr as string, unit: RA_TYPE_GALACTIC.label },
    decGalactic: { value: target.decStr as string, unit: RA_TYPE_GALACTIC.label },
    raEquatorial: { value: 0, unit: RA_TYPE_ICRS.label },
    decEquatorial: { value: 0, unit: RA_TYPE_ICRS.label },
    elevation: { value: observation.elevation, unit: 'deg' },
    advancedData: null,
    modules: []
  };

  /*if (mocked) {
    return Promise.resolve(ZOOM_DATA_MOCKED);
  } else {
   */
  const URL_PATH = `/zoom/calculate`;

  let properties = isLow(telescope)
    ? addPropertiesLOW(standardData, zoomData, observation)
    : addPropertiesMID(standardData, zoomData, observation);

  // const mapping: Function = undefined;
  return Fetch(
    axiosClient,
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
export default GetZoomData;
