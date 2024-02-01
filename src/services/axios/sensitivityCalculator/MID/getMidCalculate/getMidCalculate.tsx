import axios from 'axios';
import { USE_LOCAL_DATA, SKA_SENSITIVITY_CALCULATOR_API_URL } from '../../../../../utils/constants';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function GetMidCalculate() {
  const apiUrl = SKA_SENSITIVITY_CALCULATOR_API_URL;
  const URL_MID = `mid/`;
  const URL_CALCULATE = `calculate`;
  const DEFAULT_QUERRY_PARAMETERS = `rx_band=Band%201&ra_str=00:00:00.0&dec_str=00:00:00.0&array_configuration=AA4&pwv=10&el=45&frequency=797500000&bandwidth=435000000&n_subbands=1&resolution=13440&weighting=uniform&calculator_mode=continuum&taper=0&integration_time=600`;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  try {
    const result = await axios.get(`${apiUrl}${URL_MID}${URL_CALCULATE}?${DEFAULT_QUERRY_PARAMETERS}`, config);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result;
  } catch (e) {
    return { error: e.message };
  }
}

export default GetMidCalculate;
