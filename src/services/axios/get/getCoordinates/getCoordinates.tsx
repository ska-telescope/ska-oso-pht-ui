import { isAxiosError } from 'axios';
import { SKA_OSO_SERVICES_URL } from '@utils/constants.ts';
import axiosClient from '../../axiosClient/axiosClient.tsx';

const UNITS = ['equatorial', 'galactic'];

// Error codes are keys under resolve.error in the translations
export const RESOLVE_ERROR_NOT_FOUND = 'notFound';
export const RESOLVE_ERROR_UNAVAILABLE = 'unavailable';
export const RESOLVE_ERROR_UNKNOWN = 'API_UNKNOWN_ERROR';

// A missing response (network error or timeout) or a 5xx usually means the external name
// resolvers (SIMBAD, NED, VizieR) could not be reached, rather than that the name is wrong
const resolveErrorCode = (e: unknown): string => {
  if (!isAxiosError(e)) {
    return RESOLVE_ERROR_UNKNOWN;
  }
  const status = e.response?.status;
  if (status === 404) {
    return RESOLVE_ERROR_NOT_FOUND;
  }
  if (status === undefined || status >= 500) {
    return RESOLVE_ERROR_UNAVAILABLE;
  }
  return RESOLVE_ERROR_UNKNOWN;
};

async function GetCoordinates(targetName: string, skyUnits: number) {
  const units = skyUnits < 0 || skyUnits > UNITS.length - 1 ? 0 : skyUnits;

  try {
    const URL_PATH = `/coordinates/`;
    /* This is a rare case where the OSO-services endpoint is open to the public */
    const result = await axiosClient.get(
      `${SKA_OSO_SERVICES_URL}${URL_PATH}${targetName}/${UNITS[units]}`
    );
    return typeof result === 'undefined' ? { error: RESOLVE_ERROR_UNKNOWN } : result.data;
  } catch (e) {
    return { error: resolveErrorCode(e) };
  }
}

export default GetCoordinates;
