import axios from 'axios';
import { USE_LOCAL_DATA, SKA_SENSITIVITY_CALCULATOR_API_URL } from '../../../../utils/constants';
import { MockResponseMidCalculateZoom, MockResponseMidCalculate } from './mockResponseMidCalculate';
import { MockResponseLowCalculate, MockResponseLowCalculateZoom } from './mockResponseLowCalculate';
import Observation from 'services/types/observation';
import { OBSERVATION } from '../../../../utils/constants';

async function GetCalculate(telescope: string, mode: string, observation: Observation) {
  const apiUrl = SKA_SENSITIVITY_CALCULATOR_API_URL;
  // Telescope URLS
  let URL_TELESCOPE: string;
  const URL_MID = `mid/`;
  const URL_LOW = `low/`;
  // Mode URLs
  const URL_ZOOM = `zoom/`;
  const URL_CONTINUUM = `continuum/`;
  let URL_MODE: string;
  const URL_CALCULATE = `calculate`;

  let QUERY_STRING_PARAMETERS: string | string[][] | Record<string, string> | URLSearchParams;
  let MOCK_RESPONSE: any;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  function mapQueryMidCalculate() {
    return {
      rx_band: `Band ${observation.observing_band.toString()}`,
      ra_str: '00:00:00.0', // TODO: get from target
      dec_str: '00:00:00.0', // TODO: get from target
      array_configuration: OBSERVATION.array[0].subarray.find(
        obj => obj.value === observation.subarray
      ).label,
      pwv: observation.weather,
      el: observation.elevation,
      frequency: observation.central_frequency,
      bandwidth: observation.bandwidth.toString(),
      n_subbands: observation.number_of_sub_bands.toString(),
      resolution: observation.spectral_resolution.toString(),
      weighting: OBSERVATION.ImageWeighting.find(obj => obj.value === observation.image_weighting)
        .label,
      calculator_mode: 'continuum',
      taper: observation.tapering.toString(),
      integration_time: observation.integration_time
    };
  }

  function mapQueryMidCalculateZoom() {
    return {
      rx_band: `Band ${observation.observing_band.toString()}`,
      ra_str: '00:00:00.0', // TODO: get from target
      dec_str: '00:00:00.0', // TODO: get from target
      array_configuration: OBSERVATION.array[0].subarray.find(
        obj => obj.value === observation.subarray
      ).label,
      pwv: observation.weather,
      el: observation.elevation,
      frequency: observation.central_frequency,
      bandwidth: observation.bandwidth.toString(),
      zoom_frequencies: observation.central_frequency,
      zoom_resolutions: observation.effective_resolution.toString(),
      weighting: OBSERVATION.ImageWeighting.find(obj => obj.value === observation.image_weighting)
        .label,
      calculator_mode: 'line',
      taper: observation.tapering.toString(),
      integration_time: observation.integration_time
    };
  }

  function getSubarrayType(_subArray: string, telescope: string) {
    const subArray = _subArray.replace('*', '').replace('(core only)', '');
    const star = _subArray.includes('*') ? 'star' : '';
    const type = _subArray.includes('core') ? 'core_only' : 'all';
    return `${telescope}_${subArray}${star}_${type}`.replace(' ', '');
  }

  function mapQueryLowCalculate() {
    const subArray = OBSERVATION.array[1].subarray.find(obj => obj.value === observation.subarray)
      .label;
    return {
      subarray_configuration: getSubarrayType(subArray, 'LOW'), // 'for example: LOW_AA4_all',
      duration: observation.integration_time,
      pointing_centre: '00:00:00.0 00:00:00.0', // TODO: get from target (Right Ascension + Declination)
      freq_centre: observation.central_frequency,
      elevation_limit: observation.elevation,
      bandwidth_mhz: observation.bandwidth.toString(),
      spectral_averaging_factor: observation.spectral_averaging.toString()
    };
  }

  function mapQueryLowCalculateZoom() {
    const subArray = OBSERVATION.array[1].subarray.find(obj => obj.value === observation.subarray)
      .label;
    return {
      subarray_configuration: getSubarrayType(subArray, 'LOW'), // 'for example: LOW_AA4_all',
      duration: observation.integration_time,
      pointing_centre: '00:00:00.0 00:00:00.0', // TODO: get from target (Right Ascension + Declination)
      freq_centre: observation.central_frequency,
      elevation_limit: observation.elevation,
      spectral_resolution_hz: observation.spectral_resolution.toString(),
      total_bandwidth_khz: observation.bandwidth.toString()
    };
  }

  switch (telescope) {
    case 'Mid':
      URL_TELESCOPE = URL_MID;
      switch (mode) {
        case 'Continuum':
          URL_MODE = '';
          QUERY_STRING_PARAMETERS = mapQueryMidCalculate();
          MOCK_RESPONSE = MockResponseMidCalculate;
          break;
        case 'Zoom':
          URL_MODE = '';
          QUERY_STRING_PARAMETERS = mapQueryMidCalculateZoom();
          MOCK_RESPONSE = MockResponseMidCalculateZoom;
          break;
        default:
          console.log('Invalid mode'); // TODO return error properly for user
      }
      break;
    case 'Low':
      URL_TELESCOPE = URL_LOW;
      switch (mode) {
        case 'Continuum':
          URL_MODE = URL_CONTINUUM;
          QUERY_STRING_PARAMETERS = mapQueryLowCalculate();
          MOCK_RESPONSE = MockResponseLowCalculate;
          break;
        case 'Zoom':
          URL_MODE = URL_ZOOM;
          QUERY_STRING_PARAMETERS = mapQueryLowCalculateZoom();
          MOCK_RESPONSE = MockResponseLowCalculateZoom;
          break;
        default:
          console.log('Invalid mode'); // TODO return error properly for user
      }
      break;
    default:
      console.log('Invalid telescope'); // TODO return error properly for user
  }

  /*
  if (USE_LOCAL_DATA) {
    return MOCK_RESPONSE;
  }
  */

  try {
    console.log('QUERY_STRING_PARAMETERS', QUERY_STRING_PARAMETERS);
    const queryString = new URLSearchParams(QUERY_STRING_PARAMETERS).toString();
    const result = await axios.get(
      `${apiUrl}${URL_TELESCOPE}${URL_MODE}${URL_CALCULATE}?${queryString}`,
      config
    );
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default GetCalculate;
