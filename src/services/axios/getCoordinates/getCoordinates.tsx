import axios from 'axios';
import { SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';

const MOCK_UNITS = ['EQUATORIAL', 'GALACTIC'];
const MOCK_RESULTS = [
  {
    equatorial: {
      declination: '22:00:53.000',
      right_ascension: '05:34:30.900'
    }
  },
  {
    galactic: {
      latitude: -5.78763,
      longitude: 184.555
    }
  }
];

const mapping = (
  response:
    | { equatorial: { declination: string; right_ascension: string }; galactic?: undefined }
    | { galactic: { latitude: number; longitude: number }; equatorial?: undefined }
) => {
  if (response.equatorial) {
    return (
      response.equatorial.declination + ' ' + response.equatorial.right_ascension + ' equatorial'
    );
  } else if (response.galactic) {
    return response.galactic.latitude + ' ' + response.galactic.longitude + ' galactic';
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
  console.log("TREVOR", targetName, units);
  if (USE_LOCAL_DATA) {
    return targetName?.trim() === 'M1' ? mapping(MOCK_RESULTS[units]) : { error: 'resolve.error.name' };
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
