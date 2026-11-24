import { isAxiosError } from 'axios';
import { mapAxiosError } from '../axiosAuthClient/axiosAuthClient';
import { osoApiBasePath } from '../generatedClient/osoApiConfig';

// TODO: come back to this and consolidate with the ODT UI, which has the same ApiResult and
// handleApiError in src/services/apiService.ts.
export type ApiResult<T> = {
  data?: T;
  error?: string;
};

export const UNKNOWN_API_ERROR = 'error.API_UNKNOWN_ERROR';

// Maps anything thrown by a generated client call to an ApiResult, so callers never see a throw.
export function handleApiError<T>(error: unknown): ApiResult<T> {
  if (isAxiosError(error)) {
    if (error.code === 'ERR_NETWORK') {
      // The server isn't reachable and hasn't returned a response.
      return {
        error: `Server not reachable. Ensure the OSO Services instance at ${osoApiBasePath || window.location.origin} is running.`
      };
    }

    const detail = (error.response?.data as { detail?: unknown } | undefined)?.detail;

    if (error.response?.status === 404 && detail === 'Not Found') {
      // The server can be reached but the path is not available on it. This is distinct from a
      // 404 the server returns when the requested resource cannot be found in the ODA.
      return {
        error: `Not found. Check the URL path in\n ${error.request?.responseURL}\n is correct.`
      };
    }

    if (error.response?.status === 422) {
      // Probably a failed validation against the Pydantic schema
      return { error: `Unprocessable Entity:\n ${JSON.stringify(detail, null, 2)}` };
    }

    // Timeouts, ska-oso-services ErrorResponse bodies, bare status codes and the rest
    return { error: mapAxiosError(error).message };
  }

  if (error instanceof Error) {
    return { error: error.message };
  }

  return { error: UNKNOWN_API_ERROR };
}
