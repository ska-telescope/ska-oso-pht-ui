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
async function GetCalculate(telescope, mode, observation: Observation) {
  // TODO: send QUERY_STRING_PARAMETERS to service instead of using MOCK QUERIES
  const apiUrl = SKA_SENSITIVITY_CALCULATOR_API_URL;
  // Telescope URLS
  let URL_TELESCOPE;
  const URL_MID = `mid/`;
  const URL_LOW = `low/`;
  // Mode URLs
  const URL_ZOOM = `zoom/`;
  const URL_CONTINUUM = `continuum/`;
  let URL_MODE;
  const URL_CALCULATE = `calculate`;
  // Mocks query strings parameters
  let QUERY_STRING_PARAMETERS;
  let MOCK_CONTINUUM_QUERY;
  let MOCK_ZOOM_QUERY;
  // Mocks responses
  let MOCK_RESPONSE;
  let MOCK_RESPONSE_CONTINUUM;
  let MOCK_RESPONSE_ZOOM;
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
  }

  function mapQueryLowCalculate() {
    console.log('::: in mapQueryLowCalculate');
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
          QUERY_STRING_PARAMETERS = MockQueryMidCalculateZoom;
          mapQueryMidCalculateZoom();
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
          QUERY_STRING_PARAMETERS = MockQueryLowCalculate;
          mapQueryLowCalculate();
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
