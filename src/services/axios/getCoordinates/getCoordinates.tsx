import axios from 'axios';
import { SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';

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
      response.equatorial.dec + ' ' + response.equatorial.ra + ' equatorial'
    );
  } else if (response.galactic) {
    return response.galactic.lat + ' ' + response.galactic.lon + ' galactic';
  } else {
    return { error: 'resolve.error.results' };
  }
};

async function GetCoordinates(targetName: string, skyUnits: number) {
  const apiUrl = SKA_PHT_API_URL;
  const URL_COORDINATES = `/coordinates/`;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  const units = skyUnits < 0 || skyUnits > MOCK_UNITS.length - 1 ? 0 : skyUnits;
  if (USE_LOCAL_DATA) {
    return targetName?.trim() === 'M1'
      ? mapping(MOCK_RESULTS[units])
      : { error: 'resolve.error.name' };
  }

  try {
    const result = await axios.get(
      `${apiUrl}${URL_COORDINATES}${targetName}/${MOCK_UNITS[units]}`,
      config
    );
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : mapping(result.data);
  } catch (e) {
    return { error: e.message };
  }
}

export default GetCoordinates;
