import { type AxiosResponse, isAxiosError } from 'axios';
import { mapAxiosError } from './auth';
import { osoApiBasePath } from './client';

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

/**
 * Makes an API call and returns its result as an ApiResult, never throwing. The response data is
 * mapped to the app's model by `map`; a response without data, or one that can't be mapped, is an
 * error. `allowEmpty` is for calls that return nothing on success, such as a 204.
 */
export async function callApi<R, T = R>(
  call: () => Promise<AxiosResponse<R>>,
  map: (data: R) => T = (data) => data as unknown as T,
  { allowEmpty = false }: { allowEmpty?: boolean } = {}
): Promise<ApiResult<T>> {
  try {
    const response = await call();
    if (response?.data === undefined || response?.data === null || response?.data === '') {
      return allowEmpty ? { data: undefined } : { error: UNKNOWN_API_ERROR };
    }
    return { data: map(response.data) };
  } catch (err) {
    return handleApiError(err);
  }
}
