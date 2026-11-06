import { isAxiosError } from 'axios';
import { SKA_OSO_SERVICES_URL } from '@utils/constants.ts';
import axiosClient from '../../axiosClient/axiosClient.tsx';

const UNITS = ['equatorial', 'galactic'];

// Error codes are keys under resolve.error in the translations. They are only shown when the
// backend sends no message of its own (e.g. the request got no response).
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

// The backend's own description of the failure (FastAPI sends it as `detail`), if there is one
const resolveErrorMessage = (e: unknown): string | undefined => {
  const detail = isAxiosError(e) ? e.response?.data?.detail : undefined;
  return typeof detail === 'string' && detail.trim() ? detail : undefined;
};

export type ResolveError = { error: string; message?: string };

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
    const message = resolveErrorMessage(e);
    return { error: resolveErrorCode(e), ...(message && { message }) } as ResolveError;
  }
}

export default GetCoordinates;
