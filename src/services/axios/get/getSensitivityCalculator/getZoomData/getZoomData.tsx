import Observation from '@utils/types/observation';
import Target from '@utils/types/target';
import { presentUnits } from '@utils/present/present';
import { StandardData, ZoomData, Telescope } from '@utils/types/typesSensCalc.tsx';
import {
  SA_CUSTOM,
  STATUS_ERROR,
  STATUS_OK,
  TIME_HOURS,
  FREQUENCY_MHZ,
  DECIMAL_PLACES,
  IW_BRIGGS,
  REFERENCE_COORDINATE_TYPE_GALACTIC,
  REFERENCE_COORDINATE_TYPE_ICRS,
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
  getSensitivitiesUnitsMapping,
  timeConversion
} from '@utils/helpersSensCalc.ts';
import { FREQUENCY_HZ, SUPPLIED_TYPE_SENSITIVITY } from '@utils/constants.ts';
import { ResultsSection, SensCalcResults } from '@utils/types/sensCalcResults.tsx';
import { OSD_CONSTANTS } from '@utils/OSDConstants.ts';
import sensCalHelpers, {
  getPointingCentre,
  getRxBandValue,
  SensCalcQueryParams
} from '../sensitivityCalculator/sensCalHelpers';
import Fetch from '../fetch/Fetch';
import axiosClient from '@/services/axios/axiosClient/axiosClient';
import { DataProductSDPNew, SDPSpectralData } from '@/utils/types/dataProduct';
import { frequencyConversion, getSpectralResolutionHz } from '@/utils/helpers';

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
  sensCalcApiResponse: any,
  observation: Observation
): SensCalcResults {
  const isSuppliedSensitivity = () => observation.supplied.type === SUPPLIED_TYPE_SENSITIVITY;

  const individualResults = getFinalIndividualResultsForZoom(sensCalcApiResponse, observation);

  const theResults: SensCalcResults = {
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

  const transformed_result = results.transformed_result[0]; // ui only uses first result

  const suppliedType = OSD_CONSTANTS.Supplied.find(
    (sup) => sup.value === theObservation.supplied.type
  )?.sensCalcResultsLabel;

  const shifted1 = shiftSensitivity(transformed_result?.weighted_continuum_sensitivity);
  const results1 = {
    field: `continuumSensitivityWeighted`,
    value: shifted1.value.toString(),
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
      ? (transformed_result?.spectral_integration_time?.unit ?? 'ERR10a')
      : (transformed_result?.spectral_surface_brightness_sensitivity?.unit ?? 'ERR10b')
  };

  const results11 = {
    field: suppliedType,
    value: theObservation?.supplied?.value?.toString(),
    units:
      OSD_CONSTANTS.Supplied.find((s) => s.sensCalcResultsLabel === suppliedType)?.units?.find(
        (u) => u.value === theObservation.supplied.units
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

const addPropertiesLOW = (
  standardData: StandardData,
  zoomData: ZoomData,
  observation: Observation
) => {
  const properties: SensCalcQueryParams = {
    pointing_centre: getPointingCentre(standardData),
    elevation_limit: Number(standardData.elevation.value),
    freq_centres_mhz: frequencyConversion(
      zoomData.centralFrequency?.value,
      Number(zoomData.centralFrequency?.unit),
      FREQUENCY_MHZ
    ),
    spectral_resolutions_hz: getSpectralResolutionHz(observation),
    total_bandwidths_khz: sensCalHelpers.format.convertBandwidthToKHz(
      zoomData.bandwidth.value,
      zoomData.bandwidth.unit
    ),
    weighting_mode: getImageWeightingMapping(zoomData.imageWeighting) ?? ''
  };

  if (standardData.subarray !== SA_CUSTOM) {
    properties.subarray_configuration = standardData.subarray;
  } else {
    properties.num_stations = standardData.numStations;
  }

  if (isSuppliedTime(zoomData.suppliedType)) {
    properties.integration_time_h = timeConversion(
      zoomData.supplied_0?.value,
      Number(zoomData.supplied_0?.unit),
      TIME_HOURS
    );
  } else {
    properties.sensitivity_jy = zoomData.supplied_1.value;
  }

  if (zoomData.imageWeighting === IW_BRIGGS) {
    properties.robustness = zoomData.robust;
  }

  return properties;
};

const addPropertiesMID = (
  standardData: StandardData,
  zoomData: ZoomData,
  observation: Observation
) => {
  const properties: SensCalcQueryParams = {
    rx_band: getRxBandValue(standardData.observingBand),
    spectral_resolutions_hz: getSpectralResolutionHz(observation),
    pointing_centre: getPointingCentre(standardData),
    pmv: Number(standardData.weather.value),
    el: Number(standardData.elevation.value),
    total_bandwidths_hz: sensCalHelpers.format.convertBandwidthToHz(
      zoomData.bandwidth.value,
      zoomData.bandwidth.unit
    ),
    weighting_mode: getImageWeightingMapping(zoomData.imageWeighting) ?? '',
    taper: zoomData.tapering
  };

  if (isSuppliedTime(zoomData.suppliedType)) {
    properties.integration_time_s = timeConversion(
      zoomData.supplied_0?.value,
      Number(zoomData.supplied_0?.unit),
      TIME_SECS
    );
  } else {
    properties.supplied_sensitivity = zoomData.supplied_1.value;
    properties.sensitivity_unit = getSensitivitiesUnitsMapping(Number(zoomData.supplied_1.unit));
  }

  if (standardData.subarray !== SA_CUSTOM) {
    properties.subarray_configuration = standardData.subarray.toUpperCase();
  } else {
    properties.n_ska = standardData.num15mAntennas;
    properties.n_meer = standardData.num13mAntennas;
  }

  properties.freq_centres_hz = frequencyConversion(
    zoomData.centralFrequency?.value,
    Number(zoomData.centralFrequency?.unit),
    FREQUENCY_HZ
  );

  if (zoomData.imageWeighting === IW_BRIGGS) {
    properties.robustness = zoomData.robust;
  }

  return properties;
};

async function GetZoomData(
  telescope: Telescope,
  observation: Observation,
  target: Target,
  dataProductSDP: DataProductSDPNew
): Promise<SensCalcResults> {
  const zoomData: ZoomData = {
    dataType: observation.type,
    // TODO we should be able to use getBandwidthZoom(observation) here, but the sens calc does
    //  not yet support arbirtary bandwidths. As we are only using the spectral part of the response
    //  we can fudge a hardcoded value for now
    bandwidth: { value: 3125.0, unit: 'kHz' },
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
    spectralResolution: '',
    imageWeighting: (dataProductSDP?.data as SDPSpectralData)?.weighting ?? IW_UNIFORM,
    robust: (dataProductSDP?.data as SDPSpectralData)?.robust ?? ROBUST_DEFAULT,
    tapering: (dataProductSDP?.data as SDPSpectralData)?.taperValue ?? TAPER_DEFAULT
  };

  const observingBand = (observation: Observation) => observation.observingBand;

  const subArray = (observation: Observation) => {
    const result = OSD_CONSTANTS.array
      .find((t) => t.value === observation.telescope)
      ?.subarray?.find((s) => s.value === observation.subarray);
    return result ? result.map : '';
  };

  const standardData: StandardData = {
    observingBand: observingBand(observation),
    weather: { value: observation.weather ?? 0, unit: 'mm' },
    subarray: subArray(observation),
    num15mAntennas: observation.num15mAntennas ?? 0,
    num13mAntennas: observation.num13mAntennas ?? 0,
    numStations: observation.numStations ?? 0,
    skyDirectionType: REFERENCE_COORDINATE_TYPE_GALACTIC,
    raGalactic: { value: target.raStr as string, unit: REFERENCE_COORDINATE_TYPE_GALACTIC.label },
    decGalactic: { value: target.decStr as string, unit: REFERENCE_COORDINATE_TYPE_GALACTIC.label },
    raEquatorial: { value: 0, unit: REFERENCE_COORDINATE_TYPE_ICRS.label },
    decEquatorial: { value: 0, unit: REFERENCE_COORDINATE_TYPE_ICRS.label },
    elevation: { value: observation.elevation, unit: 'deg' },
    advancedData: null,
    modules: []
  };

  const URL_PATH = `/zoom/calculate`;

  const properties = isLow(telescope)
    ? addPropertiesLOW(standardData, zoomData, observation)
    : addPropertiesMID(standardData, zoomData, observation);

  return Fetch(axiosClient, telescope, URL_PATH, properties).then((response) =>
    response?.statusGUI === STATUS_ERROR ? response : getFinalResults(response, observation)
  );
}
export default GetZoomData;
