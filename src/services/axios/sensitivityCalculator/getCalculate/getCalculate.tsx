import axios from 'axios';
import {
  AXIOS_CONFIG,
  MODE,
  OBSERVATION,
  SKA_SENSITIVITY_CALCULATOR_API_URL,
  TYPE_CONTINUUM,
  USE_LOCAL_DATA
} from '../../../../utils/constants';
import { MockResponseMidCalculateZoom, MockResponseMidCalculate } from './mockResponseMidCalculate';
import { MockResponseLowCalculate, MockResponseLowCalculateZoom } from './mockResponseLowCalculate';
import Observation from '../../../../utils/types/observation';
import sensCalHelpers from '../sensCalHelpers';
import { TELESCOPE_LOW, TELESCOPE_MID } from '@ska-telescope/ska-gui-components';

const TELESCOPE_LOW_NUM = 1;
const URL_CALCULATE = `calculate`;

async function GetCalculate(observation: Observation) {
  console.log('IN GETCALCULATE()');
  const apiUrl = SKA_SENSITIVITY_CALCULATOR_API_URL;

  const getTelescope = () =>
    observation.telescope === TELESCOPE_LOW_NUM ? TELESCOPE_LOW.code : TELESCOPE_MID.code;

  const getMode = () => {
    if (getTelescope() === TELESCOPE_LOW.code) {
      console.log('MODE', MODE[observation.type].toLowerCase() + '/');
      return MODE[observation.type].toLowerCase() + '/';
    }
    return '';
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
      mode_specific_parameters.n_subbands = observation.number_of_sub_bands?.toString();
      mode_specific_parameters.resolution = observation.spectral_resolution?.toString();
    } else {
      mode_specific_parameters.zoom_frequencies = observation.central_frequency?.toString();
      mode_specific_parameters.zoom_resolutions = observation.effective_resolution?.toString();
    }
    const integrationTimeUnits: string = sensCalHelpers.format.getIntegrationTimeUnitsLabel(
      observation.integration_time_units
    );
    const params = new URLSearchParams({
      rx_band: `Band ${observation.observing_band?.toString()}`,
      ra_str: '00:00:00.0', // TODO: get from target
      dec_str: '00:00:00.0', // TODO: get from target
      array_configuration: OBSERVATION.array[0].subarray.find(
        obj => obj.value === observation.subarray
      ).label,
      pwv: observation.weather?.toString(),
      el: observation.elevation?.toString(),
      frequency: observation.central_frequency?.toString(),
      bandwidth: observation.bandwidth?.toString(),
      weighting: OBSERVATION.ImageWeighting.find(
        obj => obj.value === observation.image_weighting
      ).label.toLowerCase(),
      calculator_mode: 'continuum',
      taper: observation.tapering?.toString(),
      integration_time: sensCalHelpers.format
        .convertIntegrationTimeToSeconds(Number(observation.integration_time), integrationTimeUnits)
        ?.toString(),
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

  // TODO double check obseration parameters passed in observation form as some values seem off (spectral resolution always 1? tappering always 1? -> keys mapping?)

  function mapQueryCalculateLow(): URLSearchParams {
    let mode_specific_parameters: ModeSpecificParametersLow = {};
    if (observation.type === TYPE_CONTINUUM) {
      mode_specific_parameters.bandwidth_mhz = observation.bandwidth?.toString();
      mode_specific_parameters.spectral_averaging_factor = observation.spectral_averaging?.toString();
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
    const subArray = OBSERVATION.array[1].subarray.find(obj => obj.value === observation.subarray)
      ?.label;
    const integrationTimeUnits: string = sensCalHelpers.format.getIntegrationTimeUnitsLabel(
      observation.integration_time_units
    );
    const params = new URLSearchParams({
      subarray_configuration: sensCalHelpers.format.getLowSubarrayType(subArray, 'LOW'), // 'for example: LOW_AA4_all',
      duration: sensCalHelpers.format
        .convertIntegrationTimeToSeconds(Number(observation.integration_time), integrationTimeUnits)
        ?.toString(),
      pointing_centre: '00:00:00.0 00:00:00.0', // TODO: get from target (Right Ascension + Declination)
      freq_centre: observation.central_frequency?.toString(),
      elevation_limit: observation.elevation?.toString(),
      ...mode_specific_parameters
    });
    return params;
  }

  /*************************************************************************************************************************/

  const getQueryParams = () => {
    return getTelescope() === TELESCOPE_LOW.code ? mapQueryCalculateLow() : mapQueryCalculateMid();
  };

  const getMockData = () => {
    if (getTelescope() === TELESCOPE_LOW.code) {
      return observation.type ? MockResponseLowCalculate : MockResponseLowCalculateZoom;
    }
    return observation.type ? MockResponseMidCalculate : MockResponseMidCalculateZoom;
  };

  //if (USE_LOCAL_DATA) {
  return getMockData();
  //}

  try {
    const result = await axios.get(
      `${apiUrl}${getTelescope()}/${getMode()}${URL_CALCULATE}?${getQueryParams()}`,
      AXIOS_CONFIG
    );
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default GetCalculate;
