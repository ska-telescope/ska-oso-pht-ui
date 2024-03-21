import axios from 'axios';
import { USE_LOCAL_DATA, SKA_SENSITIVITY_CALCULATOR_API_URL } from '../../../../utils/constants';
import {
  MockQueryMidCalculate,
  MockQueryMidCalculateZoom,
  MockResponseMidCalculateZoom,
  MockResponseMidCalculate
} from './mockResponseMidCalculate';
import {
  MockQueryLowCalculate,
  MockQueryLowCalculateZoom,
  MockResponseLowCalculate,
  MockResponseLowCalculateZoom
} from './mockResponseLowCalculate';
import Observation from 'services/types/observation';
import { OBSERVATION } from '../../../../utils/constants';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function GetCalculate(telescope: string, mode: string, observation: Observation) {
  // TODO: send QUERY_STRING_PARAMETERS to service instead of using MOCK QUERIES
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
  // Mocks query strings parameters
  let QUERY_STRING_PARAMETERS: string | string[][] | Record<string, string> | URLSearchParams;
  let MOCK_CONTINUUM_QUERY: any;
  let MOCK_ZOOM_QUERY: any;
  // Mocks responses
  let MOCK_RESPONSE: any;
  let MOCK_RESPONSE_CONTINUUM: any;
  let MOCK_RESPONSE_ZOOM: any;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  function mapping(observation: Observation) {
    console.log('in mapping', observation);
  }

  function mapQueryMidCalculate() {
    console.log('::: in mapQueryMidCalculate');
    const query = {
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
    console.log('::: query', query);
    return query;
  }

  function mapQueryMidCalculateZoom() {
    console.log('::: in mapQueryMidCalculateZoom');
    const query = {
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
    console.log('::: query mapQueryMidCalculateZoom', query);
    return query;
  }

  function getSubarrayType(_subArray: string, telescope: string) {
    const subArray = _subArray.replace('*', '').replace('(core only)', '');
    const star = _subArray.includes('*') ? 'star' : '';
    const type = _subArray.includes('core') ? 'core_only' : 'all';
    return `${telescope}_${subArray}${star}_${type}`.replace(' ', '');
  }

  function mapQueryLowCalculate() {
    console.log('::: in mapQueryLowCalculate');
    const subArray = OBSERVATION.array[1].subarray.find(obj => obj.value === observation.subarray)
      .label;
    const query = {
      subarray_configuration: getSubarrayType(subArray, 'LOW'), // 'LOW_AA4_all',
      duration: observation.integration_time,
      pointing_centre: '00:00:00.0 00:00:00.0', // TODO: get from target (Right Ascension + Declination)
      freq_centre: observation.central_frequency,
      elevation_limit: observation.elevation,
      bandwidth_mhz: observation.bandwidth.toString(),
      spectral_averaging_factor: observation.spectral_averaging.toString()
    };
    console.log('::: query', query);
    return query;
  }

  function mapQueryLowCalculateZoom() {
    console.log('::: in mapQueryLowCalculateZoom');
  }

  switch (telescope) {
    case 'Mid':
      URL_TELESCOPE = URL_MID;
      switch (mode) {
        case 'Continuum':
          console.log('Mid telescope in Continuum mode');
          URL_MODE = '';
          // QUERY_STRING_PARAMETERS = MockQueryMidCalculate;
          QUERY_STRING_PARAMETERS = mapQueryMidCalculate();
          break;
        case 'Zoom':
          console.log('Mid telescope in Zoom mode');
          URL_MODE = '';
          // QUERY_STRING_PARAMETERS = MockQueryMidCalculateZoom;
          QUERY_STRING_PARAMETERS = mapQueryMidCalculateZoom();
          break;
        default:
          console.log('Invalid mode');
      }
      break;
    case 'Low':
      URL_TELESCOPE = URL_LOW;
      switch (mode) {
        case 'Continuum':
          console.log('Low telescope in Continuum mode');
          URL_MODE = URL_CONTINUUM;
          // QUERY_STRING_PARAMETERS = MockQueryLowCalculate;
          QUERY_STRING_PARAMETERS = mapQueryLowCalculate();
          break;
        case 'Zoom':
          console.log('Low telescope in Zoom mode');
          URL_MODE = URL_ZOOM;
          QUERY_STRING_PARAMETERS = MockQueryLowCalculateZoom;
          mapQueryLowCalculateZoom();
          break;
        default:
          console.log('Invalid mode');
      }
      break;
    default:
      console.log('Invalid telescope');
  }

  // let query = mapping(observation);
  mapping(observation);

  if (USE_LOCAL_DATA) {
    return MOCK_RESPONSE;
  }

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
