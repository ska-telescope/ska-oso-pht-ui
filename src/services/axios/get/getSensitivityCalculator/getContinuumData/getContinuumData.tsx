import { presentUnits } from '@utils/present/present';
import { ContinuumData, StandardData, Telescope } from '@utils/types/typesSensCalc.tsx';
import {
  DECIMAL_PLACES,
  FREQUENCY_HZ,
  FREQUENCY_MHZ,
  IW_UNIFORM,
  REFERENCE_COORDINATE_TYPE_GALACTIC,
  REFERENCE_COORDINATE_TYPE_ICRS,
  ROBUST_DEFAULT,
  SA_CUSTOM,
  STATUS_OK,
  STATUS_ERROR,
  TAPER_DEFAULT,
  TIME_HOURS,
  TIME_SECS,
  FREQUENCY_KHZ,
  IMAGE_WEIGHTING_DEFAULT,
  IW_BRIGGS,
  LOW_CONTINUUM_SPECTRAL_RESOLUTION_KHZ
} from '@utils/constants';
import {
  getImageWeightingMapping,
  getSensitivitiesUnitsMapping,
  isLow,
  isSuppliedTime,
  shiftSensitivity,
  timeConversion
} from '@utils/helpersSensCalc.ts';
import { SUPPLIED_TYPE_SENSITIVITY, TYPE_CONTINUUM } from '@utils/constants.ts';
import { ResultsSection, SensCalcResults } from '@utils/types/sensCalcResults.tsx';
import { OSD_CONSTANTS } from '@utils/OSDConstants.ts';
import Target from '@/utils/types/target';
import Observation from '@/utils/types/observation';
import axiosClient from '@/services/axios/axiosClient/axiosClient';
import { DataProductSDPNew, SDPImageContinuumData } from '@/utils/types/dataProduct';
import Fetch from '../fetch/Fetch';
import { frequencyConversion } from '@/utils/helpers';
import {
  getPointingCentre,
  getRxBandValue,
  SensCalcQueryParams
} from '@services/axios/get/getSensitivityCalculator/sensitivityCalculator/sensCalHelpers.ts';

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
  const isContinuum = () => observation.type === TYPE_CONTINUUM;

  const individualResults = getFinalIndividualResultsForContinuum(sensCalcApiResponse, observation);

  const theResults: SensCalcResults = {
    statusGUI: STATUS_OK,
    section1: [],
    ...(isContinuum() && {
      section2: []
    }),
    section3: [individualResults.results11]
  };

  if (!isSuppliedSensitivity()) {
    theResults.section1?.push(individualResults.results1);
  }
  theResults.section1?.push(individualResults.results2);
  if (!isSuppliedSensitivity()) {
    theResults.section1?.push(individualResults.results3);
  }
  theResults.section1?.push(individualResults.results4);
  theResults.section1?.push(individualResults.results5);

  if (isContinuum()) {
    if (!isSuppliedSensitivity()) {
      theResults.section2?.push(individualResults.results6);
    }
    theResults.section2?.push(individualResults.results7);
    if (!isSuppliedSensitivity()) {
      theResults.section2?.push(individualResults.results8);
    }
    theResults.section2?.push(individualResults.results9);
    theResults.section2?.push(individualResults.results10);
  }
  return theResults;
}

export function getSensCalcContinuumParams(
  telescope: Telescope,
  observation: Observation,
  target: Target,
  dataProductSDP: DataProductSDPNew
): SensCalcQueryParams {
  const continuumData: ContinuumData = {
    dataType: observation.type,
    bandwidth: {
      value: observation?.continuumBandwidth ?? 0,
      unit: observation?.continuumBandwidthUnits?.toString() ?? ''
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
    spectralAveragingFactor: getSpectralAveragingFactor(observation, dataProductSDP),
    numberOfSubBands: observation?.numSubBands ?? 0,
    imageWeighting: (dataProductSDP?.data as SDPImageContinuumData)?.weighting ?? IW_UNIFORM,
    robust: (dataProductSDP?.data as SDPImageContinuumData)?.robust ?? ROBUST_DEFAULT,
    tapering: (dataProductSDP?.data as SDPImageContinuumData)?.taperValue ?? TAPER_DEFAULT
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
    raGalactic: { value: String(target.raStr), unit: REFERENCE_COORDINATE_TYPE_GALACTIC.label },
    decGalactic: { value: String(target.decStr), unit: REFERENCE_COORDINATE_TYPE_GALACTIC.label },
    raEquatorial: { value: 0, unit: REFERENCE_COORDINATE_TYPE_ICRS.label },
    decEquatorial: { value: 0, unit: REFERENCE_COORDINATE_TYPE_ICRS.label },
    elevation: { value: observation.elevation, unit: 'deg' },
    advancedData: null,
    modules: []
  };

  return isLow(telescope)
    ? addPropertiesLOW(standardData, continuumData)
    : addPropertiesMID(standardData, continuumData);
}

const toFixed = (value: number) => {
  if (value === undefined || value === null) {
    return 0;
  }
  return Number(value).toFixed(DECIMAL_PLACES);
};

export function getFinalIndividualResultsForContinuum(
  results: any,
  theObservation: {
    supplied: { type: number; value: { toString: () => any }; units: number };
    type: string;
  }
): FinalIndividualResults {
  const isSuppliedSensitivity = () => theObservation.supplied.type === SUPPLIED_TYPE_SENSITIVITY;

  const transformed_result = results.transformed_result;

  const observationTypeLabel: string = theObservation.type;
  const suppliedType = OSD_CONSTANTS.Supplied.find(
    (sup) => sup.value === theObservation.supplied.type
  )?.sensCalcResultsLabel;

  const shifted1 = shiftSensitivity(transformed_result?.weighted_continuum_sensitivity);
  const results1 = {
    field: `${observationTypeLabel}SensitivityWeighted`,
    value: shifted1.value.toString(),
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

const addPropertiesLOW = (standardData: StandardData, continuumData: ContinuumData) => {
  const properties: SensCalcQueryParams = {
    elevation_limit: Number(standardData.elevation.value),
    pointing_centre: getPointingCentre(standardData),
    freq_centre_mhz: frequencyConversion(
      continuumData.centralFrequency?.value,
      Number(continuumData.centralFrequency?.unit),
      FREQUENCY_MHZ
    ),
    bandwidth_mhz: frequencyConversion(
      continuumData.bandwidth?.value,
      Number(continuumData.bandwidth?.unit),
      FREQUENCY_MHZ
    ),
    spectral_averaging_factor: continuumData.spectralAveragingFactor,
    n_subbands: continuumData.numberOfSubBands,
    weighting_mode: getImageWeightingMapping(continuumData.imageWeighting) ?? ''
  };

  if (standardData.subarray !== SA_CUSTOM) {
    properties.subarray_configuration = standardData.subarray;
  } else {
    properties.num_stations = standardData.numStations;
  }

  if (isSuppliedTime(continuumData.suppliedType)) {
    properties.integration_time_h = timeConversion(
      continuumData.supplied_0?.value,
      Number(continuumData.supplied_0?.unit),
      TIME_HOURS
    );
  } else {
    properties.sensitivity_jy = continuumData.supplied_1.value;
  }

  if (continuumData.imageWeighting === IW_BRIGGS) {
    properties.robustness = continuumData.robust;
  }

  return properties;
};

const addPropertiesMID = (standardData: StandardData, continuumData: ContinuumData) => {
  const properties: SensCalcQueryParams = {
    rx_band: getRxBandValue(standardData.observingBand),
    freq_centre_hz: frequencyConversion(
      continuumData.centralFrequency?.value,
      Number(continuumData.centralFrequency?.unit),
      FREQUENCY_HZ
    ),
    bandwidth_hz: frequencyConversion(
      continuumData.bandwidth?.value,
      Number(continuumData.bandwidth?.unit),
      FREQUENCY_HZ
    ),
    spectral_averaging_factor: continuumData.spectralAveragingFactor,
    pointing_centre: getPointingCentre(standardData),
    pmv: Number(standardData.weather.value),
    el: Number(standardData.elevation.value),
    n_subbands: continuumData.numberOfSubBands,
    weighting_mode: getImageWeightingMapping(continuumData.imageWeighting) ?? '',
    taper: continuumData.tapering
  };

  if (isSuppliedTime(continuumData.suppliedType)) {
    properties.integration_time_s = timeConversion(
      continuumData.supplied_0?.value,
      Number(continuumData.supplied_0?.unit),
      TIME_SECS
    );
  } else {
    properties.supplied_sensitivity = continuumData.supplied_1.value;
    properties.sensitivity_unit = getSensitivitiesUnitsMapping(
      Number(continuumData.supplied_1.unit)
    );
  }

  if (standardData.subarray !== SA_CUSTOM) {
    properties.subarray_configuration = standardData.subarray.toUpperCase();
  } else {
    properties.n_ska = standardData.num15mAntennas;
    properties.n_meer = standardData.num13mAntennas;
  }

  if (continuumData.imageWeighting === IW_BRIGGS) {
    properties.robustness = continuumData.robust;
  }

  return properties;
};

export function getSpectralAveragingFactor(
  observation: Observation,
  dataProduct: DataProductSDPNew
) {
  const totalChannels =
    frequencyConversion(
      observation.continuumBandwidth,
      observation.continuumBandwidthUnits,
      FREQUENCY_KHZ
    ) / LOW_CONTINUUM_SPECTRAL_RESOLUTION_KHZ;
  return Math.floor(totalChannels / dataProduct.data.channelsOut);
}

function GetContinuumData(
  telescope: Telescope,
  observation: Observation,
  target: Target,
  dataProductSDP: DataProductSDPNew
): Promise<SensCalcResults> {
  const URL_PATH = `/continuum/calculate`;

  const properties = getSensCalcContinuumParams(telescope, observation, target, dataProductSDP);

  return Fetch(axiosClient, telescope, URL_PATH, properties).then((response) =>
    response?.statusGUI === STATUS_ERROR ? response : getFinalResults(response, observation)
  );
}
export default GetContinuumData;
