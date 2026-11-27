import { isAxiosError } from 'axios';
import { ReferenceFrame } from '@/generated/models';
import { resolvedTargetFieldsFromPdm, type TargetEntryType } from '@/models/proposals/targetEntry';
import type { ApiResult } from './apiResult';
import { publicApi } from './client';

// The reference frames, by the entry's coordinate kind (ICRS, galactic). Any other kind is
// resolved as equatorial.
const FRAMES: ReferenceFrame[] = [ReferenceFrame.Equatorial, ReferenceFrame.Galactic];

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

/** A failed resolve: an error code (see above) and the backend's message, when it sent one. */
export type ResolveError = { error: string; message?: string };

/**
 * Resolves a target name to the entry fields it sets (coordinates, and velocity or redshift), in
 * the frame of the given coordinate kind. The endpoint is public, so this works logged out.
 *
 * Unlike the other calls, a failure is an error code rather than a message (see ResolveError).
 */
export const resolveCoordinates = async (
  targetName: string,
  kind: number
): Promise<ApiResult<Partial<TargetEntryType>> & { message?: string }> => {
  const frame = FRAMES[kind] ?? ReferenceFrame.Equatorial;
  try {
    const response =
      await publicApi.common.getSystemcoordinatesOsoApiV17CoordinatesIdentifierReferenceFrameGet(
        targetName,
        frame
      );
    if (!response?.data) {
      return { error: RESOLVE_ERROR_UNKNOWN };
    }
    return { data: resolvedTargetFieldsFromPdm(response.data) };
  } catch (e) {
    const message = resolveErrorMessage(e);
    return { error: resolveErrorCode(e), ...(message && { message }) };
  }
};
