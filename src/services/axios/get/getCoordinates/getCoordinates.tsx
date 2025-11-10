import { SKA_OSO_SERVICES_URL, USE_LOCAL_DATA } from '@utils/constants.ts';
import axiosClient from '../../axiosClient/axiosClient.tsx';

const MOCK_UNITS = ['equatorial', 'galactic'];
const MOCK_RESULTS = [
  {
    equatorial: {
      ra: '21:33:27.02',
      dec: '-00:49:23.7',
      redshift: -0.000012,
      velocity: -3.6
    }
  },
  {
    galactic: {
      lon: 53.37088,
      lat: -35.76976,
      redshift: -0.000012,
      velocity: -3.6
    }
  }
];

const mapping = (
  response:
    | {
        equatorial: { ra: string; dec: string; redshift: number; velocity: number };
        galactic?: undefined;
      }
    | {
        galactic: { lon: number; lat: number; redshift: number; velocity: number };
        equatorial?: undefined;
      }
) => {
  if (response.equatorial) {
    return (
      response.equatorial.dec +
      ' ' +
      response.equatorial.ra +
      ' ' +
      response.equatorial.redshift +
      ' ' +
      response.equatorial.velocity +
      ' ' +
      MOCK_UNITS[0].toLowerCase()
    );
  } else if (response.galactic) {
    return (
      response.galactic.lon +
      ' ' +
      response.galactic.lat +
      ' ' +
      response.galactic.redshift +
      ' ' +
      response.galactic.velocity +
      ' ' +
      MOCK_UNITS[1].toLowerCase()
    );
  } else {
    return { error: 'resolve.error.results' };
  }
};

async function GetCoordinates(targetName: string, skyUnits: number) {
  const units = skyUnits < 0 || skyUnits > MOCK_UNITS.length - 1 ? 0 : skyUnits;
  if (USE_LOCAL_DATA) {
    return targetName?.trim() === 'M1' ? mapping(MOCK_RESULTS[units]) : { error: 'name' };
  }

  try {
    const URL_PATH = `/coordinates/`;
    /* This is a rare case where the OSO-services endpoint is open to the public */
    const result = await axiosClient.get(
      `${SKA_OSO_SERVICES_URL}${URL_PATH}${targetName}/${MOCK_UNITS[units]}`
    );
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : mapping(result.data);
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default GetCoordinates;
