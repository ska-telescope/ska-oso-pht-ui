import axios from 'axios';
import {
  AXIOS_CONFIG,
  OBSERVATION_TYPE_BACKEND,
  OBSERVATION,
  SKA_SENSITIVITY_CALCULATOR_API_URL,
  TYPE_CONTINUUM,
  USE_LOCAL_DATA_SENSITIVITY_CALC,
  TELESCOPE_LOW_NUM
} from '../../../../utils/constants';
import { MockResponseMidCalculateZoom, MockResponseMidCalculate } from './mockResponseMidCalculate';
import { MockResponseLowCalculate, MockResponseLowCalculateZoom } from './mockResponseLowCalculate';
import Observation from '../../../../utils/types/observation';
import sensCalHelpers from '../sensCalHelpers';
import { TELESCOPE_LOW, TELESCOPE_MID } from '@ska-telescope/ska-gui-components';

const URL_CALCULATE = `calculate`;

async function GetCalculate(observation: Observation) {
  const apiUrl = SKA_SENSITIVITY_CALCULATOR_API_URL;

  const getTelescope = () =>
    observation.telescope === TELESCOPE_LOW_NUM ? TELESCOPE_LOW.code : TELESCOPE_MID.code;

  const getMode = () =>
    observation.telescope === TELESCOPE_LOW_NUM
      ? OBSERVATION_TYPE_BACKEND[observation.type].toLowerCase() + '/'
      : '';

  const getSubArray = () => {
    const array = OBSERVATION.array.find(obj => obj.value === observation.telescope);
    const arrConfig = array.subarray.find(obj => obj.value === observation.subarray);
    return arrConfig.map;
  };

  /*********************************************************** MID *********************************************************/

  interface ModeSpecificParametersMid {
    n_subbands?: string;
    resolution?: string;
    zoom_frequencies?: string;
    zoom_resolutions?: string;
  }

  function mapQueryCalculateMid(): URLSearchParams {
    let mode_specific_parameters: ModeSpecificParametersMid = {};
    if (observation.type === TYPE_CONTINUUM) {
      mode_specific_parameters.n_subbands = observation.numSubBands?.toString();
      mode_specific_parameters.resolution = (Number(observation.spectralResolution.split(' ')[0]) * 1000).toString();
    } else {
      mode_specific_parameters.zoom_frequencies = observation.centralFrequency?.toString();
      mode_specific_parameters.zoom_resolutions = observation.effectiveResolution?.toString();
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

    const params = new URLSearchParams({
      rx_band: `Band ${observation.observingBand}`,
      ra_str: '00:00:00.0', // TODO: get from target
      dec_str: '00:00:00.0', // TODO: get from target
      array_configuration: getSubArray(),
      pwv: observation.weather?.toString(),
      el: observation.elevation?.toString(),
      frequency: observation.centralFrequency,
      bandwidth: observation.bandwidth ? observation.bandwidth?.toString() : '0',
      resolution: '0',
      weighting: weighting?.label.toLowerCase(),
      calculator_mode: 'continuum',
      taper: observation.tapering?.toString(),
      integration_time: iTime?.toString(),
      ...mode_specific_parameters
    });
    return params;
  }

  /*********************************************************** LOW *********************************************************/

  interface ModeSpecificParametersLow {
    bandwidth_mhz?: string;
    spectral_averaging_factor?: string;
    spectral_resolution_hz?: string;
    total_bandwidth_khz?: string;
  }

  // TODO double check observation parameters passed in observation form as some values seem off (spectral resolution always 1? tapering always 1? -> keys mapping?)

  function mapQueryCalculateLow(): URLSearchParams {
    let mode_specific_parameters: ModeSpecificParametersLow = {};
    if (observation.type === TYPE_CONTINUUM) {
      mode_specific_parameters.bandwidth_mhz = observation.bandwidth?.toString();
      mode_specific_parameters.spectral_averaging_factor = observation.spectralAveraging?.toString();
    } else {
      // mode_specific_parameters.spectral_resolution_hz = observation.spectral_resolution?.toString();
      const value = 16;
      mode_specific_parameters.spectral_resolution_hz = value?.toString(); // temp fix
      //TODO check value mapping, does it need conversion?
      const value2 = 48.8;
      mode_specific_parameters.total_bandwidth_khz = value2?.toString(); // temp fix
      //TODO check value mapping, does it need conversion?
      // mode_specific_parameters.total_bandwidth_khz = observation.bandwidth?.toString();
    }
    const integrationTimeUnits: string = sensCalHelpers.format.getIntegrationTimeUnitsLabel(
      observation.integrationTimeUnits
    );
    const params = new URLSearchParams({
      subarray_configuration: getSubArray(),
      duration: sensCalHelpers.format
        .convertIntegrationTimeToSeconds(Number(observation.integrationTime), integrationTimeUnits)
        ?.toString(),
      pointing_centre: '00:00:00.0 00:00:00.0', // TODO: get from target (Right Ascension + Declination)
      freq_centre: observation.centralFrequency?.toString(),
      elevation_limit: observation.elevation?.toString(),
      ...mode_specific_parameters
    });
    return params;
  }

  /*************************************************************************************************************************/

  const getQueryParams = () => {
    return observation.telescope === TELESCOPE_LOW_NUM
      ? mapQueryCalculateLow()
      : mapQueryCalculateMid();
  };

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
