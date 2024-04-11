import axios from 'axios';
import { AXIOS_CONFIG, SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';

const MOCK_UNITS = ['EQUATORIAL', 'GALACTIC'];
const MOCK_RESULTS = [
  {
    equatorial: {
      dec: '22:00:53.000',
      ra: '05:34:30.900'
    }
  },
  {
    galactic: {
      lat: -5.78763,
      lon: 184.555
    }
  }
];

const mapping = (
  response:
    | { equatorial: { dec: string; ra: string }; galactic?: undefined }
    | { galactic: { lat: number; lon: number }; equatorial?: undefined }
) => {
  if (response.equatorial) {
    return (
      response.equatorial.dec + ' ' + response.equatorial.ra + ' ' + MOCK_UNITS[0].toLowerCase()
    );
  } else if (response.galactic) {
    return response.galactic.lat + ' ' + response.galactic.lon + ' ' + MOCK_UNITS[1].toLowerCase();
  } else {
    return { error: 'resolve.error.results' };
  }
};

async function GetCoordinates(targetName: string, skyUnits: number) {
  const units = skyUnits < 0 || skyUnits > MOCK_UNITS.length - 1 ? 0 : skyUnits;
  if (USE_LOCAL_DATA) {
    return targetName?.trim() === 'M1'
      ? mapping(MOCK_RESULTS[units])
      : { error: 'resolve.error.name' };
  }

  try {
    const URL_PATH = `/coordinates/`;
    const result = await axios.get(
      `${SKA_PHT_API_URL}${URL_PATH}${targetName}/${MOCK_UNITS[units]}`,
      AXIOS_CONFIG
    );
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : mapping(result.data);
  } catch (e) {
    return { error: e.message };
  }
}

export default GetCoordinates;
