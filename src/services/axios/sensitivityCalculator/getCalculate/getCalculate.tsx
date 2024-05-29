import axios from 'axios';
import { TELESCOPE_LOW, TELESCOPE_MID } from '@ska-telescope/ska-gui-components';
import {
  AXIOS_CONFIG,
  OBSERVATION_TYPE_BACKEND,
  OBSERVATION,
  SKA_SENSITIVITY_CALCULATOR_API_URL,
  TYPE_CONTINUUM,
  USE_LOCAL_DATA_SENSITIVITY_CALC,
  TELESCOPE_LOW_NUM,
  OBSERVATION_TYPE_SENSCALC
} from '../../../../utils/constants';
import { MockResponseMidCalculateZoom, MockResponseMidCalculate } from './mockResponseMidCalculate';
import { MockResponseLowCalculate, MockResponseLowCalculateZoom } from './mockResponseLowCalculate';
import Observation from '../../../../utils/types/observation';
import sensCalHelpers from '../sensCalHelpers';
import Target from '../../../../utils/types/target';

const URL_CALCULATE = `calculate`;

async function GetCalculate(observation: Observation, target: Target) {
  const apiUrl = SKA_SENSITIVITY_CALCULATOR_API_URL;

  const getTelescope = () =>
    observation.telescope === TELESCOPE_LOW_NUM ? TELESCOPE_LOW.code : TELESCOPE_MID.code;

  const getMode = () =>
    observation.telescope === TELESCOPE_LOW_NUM
      ? `${OBSERVATION_TYPE_BACKEND[observation.type].toLowerCase()  }/`
      : '';

  const getSubArray = () => {
    const array = OBSERVATION.array.find(obj => obj.value === observation.telescope);
    const arrConfig = array?.subarray.find(obj => obj.value === observation.subarray);
    return arrConfig?.map;
  };

  // TODO : Need to know if we are getting Equatorial or Galactic  ( units ? )
  function rightAscension() {
    return target.ra
      .replace('+', '')
      .replace('-', '')
      .replace(' ', '');
  }

  function declination() {
    return target.dec
      .replace('+', '')
      .replace('-', '')
      .replace(' ', '');
  }

  /** ********************************************************* MID ******************************************************** */

  interface ModeSpecificParametersMid {
    n_subbands?: string;
    resolution?: string;
    zoom_frequencies?: string;
    zoom_resolutions?: string;
  }

  function mapQueryCalculateMid(): URLSearchParams {
    const modeSpecificParameters: ModeSpecificParametersMid = {};
    if (observation.type === TYPE_CONTINUUM) {
      modeSpecificParameters.n_subbands = observation.numSubBands?.toString();
      modeSpecificParameters.resolution = (
        Number(observation.spectralResolution.split(' ')[0]) * 1000
      ).toString(); // resolution should be sent in Hz
    } else {
      const splitZoomFrequencies: string[] = observation.centralFrequency.split(' ');
      modeSpecificParameters.zoom_frequencies = sensCalHelpers.format
        .convertFrequencyToHz(splitZoomFrequencies[0], splitZoomFrequencies[1])
        .toString();
        modeSpecificParameters.zoom_resolutions = observation.effectiveResolution?.toString();
    }

    const weighting = OBSERVATION.ImageWeighting.find(
      obj => obj.value === observation.imageWeighting
    );
    const iTimeUnits: string = sensCalHelpers.format.getIntegrationTimeUnitsLabel(
      observation.integrationTimeUnits
    );
    const iTime = sensCalHelpers.format.convertIntegrationTimeToSeconds(
      Number(observation.integrationTime),
      iTimeUnits
    );
    const splitCentralFrequency: string[] = observation.centralFrequency.split(' ');

    const params = {
      rx_band: `Band ${observation.observingBand}`,
      ra_str: rightAscension(),
      dec_str: declination(),
      array_configuration: getSubArray(),
      pwv: observation.weather?.toString(),
      el: observation.elevation?.toString(),
      frequency: sensCalHelpers.format
        .convertFrequencyToHz(splitCentralFrequency[0], splitCentralFrequency[1])
        .toString(),
      bandwidth: observation.bandwidth ? observation.bandwidth?.toString() : '0',
      resolution: '0',
      weighting: weighting?.label.toLowerCase(),
      calculator_mode: OBSERVATION_TYPE_SENSCALC[observation.type],
      taper: observation.tapering?.toString(),
      integration_time: iTime?.toString(),
      ...modeSpecificParameters
    };
    const urlSearchParams = new URLSearchParams();
    for (const key in params) urlSearchParams.append(key, params[key]);

    return urlSearchParams;
  }

  /** ********************************************************* LOW ******************************************************** */

  interface ModeSpecificParametersLow {
    bandwidth_mhz?: string;
    spectral_averaging_factor?: string;
    spectral_resolution_hz?: string;
    total_bandwidth_khz?: string;
  }

  // TODO double check observation parameters passed in observation form as some values seem off (spectral resolution always 1? tapering always 1? -> keys mapping?)

  function pointingCentre() {
    return `${rightAscension()  } ${  declination()}`;
  }

  function mapQueryCalculateLow(): URLSearchParams {
    const modeSpecificParameters: ModeSpecificParametersLow = {};
    if (observation.type === TYPE_CONTINUUM) {
      modeSpecificParameters.bandwidth_mhz = observation.bandwidth?.toString();
      modeSpecificParameters.spectral_averaging_factor = observation.spectralAveraging?.toString();
    } else {
      // mode_specific_parameters.spectral_resolution_hz = observation.spectral_resolution?.toString();
      const value = 16;
      modeSpecificParameters.spectral_resolution_hz = value?.toString(); // temp fix
      // TODO check value mapping, does it need conversion?
      const value2 = 48.8;
      modeSpecificParameters.total_bandwidth_khz = value2?.toString(); // temp fix
      // TODO check value mapping, does it need conversion?
      // mode_specific_parameters.total_bandwidth_khz = observation.bandwidth?.toString();
    }
    const integrationTimeUnits: string = sensCalHelpers.format.getIntegrationTimeUnitsLabel(
      observation.integrationTimeUnits
    );
    const params = {
      subarray_configuration: getSubArray(),
      duration: sensCalHelpers.format
        .convertIntegrationTimeToSeconds(Number(observation.integrationTime), integrationTimeUnits)
        ?.toString(),
      pointing_centre: pointingCentre(),
      freq_centre: observation.centralFrequency.split(' ')[0]?.toString(),
      elevation_limit: observation.elevation?.toString(),
      ...modeSpecificParameters
    };
    const urlSearchParams = new URLSearchParams();
    for (const key in params) urlSearchParams.append(key, params[key]);

    return urlSearchParams;
  }

  /** ********************************************************************************************************************** */

  const getQueryParams = () => observation.telescope === TELESCOPE_LOW_NUM
      ? mapQueryCalculateLow()
      : mapQueryCalculateMid();

  const getMockData = () => {
    if (observation.telescope === TELESCOPE_LOW_NUM) {
      return observation.type ? MockResponseLowCalculate : MockResponseLowCalculateZoom;
    }
    return observation.type ? MockResponseMidCalculate : MockResponseMidCalculateZoom;
  };

  if (USE_LOCAL_DATA_SENSITIVITY_CALC) {
    return getMockData();
  }

  try {
    const path = `${apiUrl}${getTelescope()}/${getMode()}${URL_CALCULATE}?${getQueryParams()}`;
    const result = await axios.get(path, AXIOS_CONFIG);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result;
  } catch (e) {
    const errorObject = {
      title: e.response.data.title,
      detail: e.response.data.detail
    };
    return { error: errorObject };
  }
}

export default GetCalculate;
