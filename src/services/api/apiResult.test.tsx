import { describe, expect, it } from 'vitest';
import { AxiosError, type AxiosResponse } from 'axios';
import { callApi, handleApiError, UNKNOWN_API_ERROR } from './apiResult';

const axiosError = (
  message: string,
  opts: { code?: string; status?: number; data?: unknown; responseURL?: string } = {}
) => {
  const error = new AxiosError(message, opts.code);
  if (opts.status !== undefined) {
    error.response = { status: opts.status, data: opts.data } as AxiosError['response'];
  }
  if (opts.responseURL) {
    error.request = { responseURL: opts.responseURL };
  }
  return error;
};

describe('handleApiError', () => {
  it('reports an unreachable server for network errors', () => {
    const result = handleApiError(axiosError('Network Error', { code: 'ERR_NETWORK' }));
    expect(result.data).toBeUndefined();
    expect(result.error).toContain('Server not reachable');
  });

  it('reports a missing path for a 404 with detail "Not Found"', () => {
    const result = handleApiError(
      axiosError('Not Found', {
        status: 404,
        data: { detail: 'Not Found' },
        responseURL: 'https://host/oso/api/v17/nope'
      })
    );
    expect(result.error).toContain('Not found. Check the URL path in');
    expect(result.error).toContain('https://host/oso/api/v17/nope');
  });

  it('does not treat a resource 404 as a missing path', () => {
    const result = handleApiError(
      axiosError('Not Found', {
        status: 404,
        data: { title: 'Not Found', detail: 'Proposal prsl-1 not found' }
      })
    );
    expect(result.error).toBe('Not Found: Proposal prsl-1 not found');
  });

  it('formats a 422 with the validation detail', () => {
    const result = handleApiError(
      axiosError('Unprocessable', { status: 422, data: { detail: [{ msg: 'field required' }] } })
    );
    expect(result.error).toContain('Unprocessable Entity:');
    expect(result.error).toContain('field required');
  });

  it('uses title and detail from an ska-oso-services error', () => {
    const result = handleApiError(
      axiosError('Forbidden', { status: 403, data: { title: 'Forbidden', detail: 'No access' } })
    );
    expect(result.error).toBe('Forbidden: No access');
  });

  it('falls back to the status code when there is no detail', () => {
    const result = handleApiError(axiosError('Server error', { status: 500, data: {} }));
    expect(result.error).toBe('Server responded with an error: 500');
  });

  it('maps timeouts', () => {
    const result = handleApiError(
      axiosError('timeout of 20000ms exceeded', { code: 'ECONNABORTED' })
    );
    expect(result.error).toBe('Request timed out. Please try again.');
  });

  it('uses the message of a plain Error', () => {
    expect(handleApiError(new Error('boom'))).toStrictEqual({ error: 'boom' });
  });

  it('returns the unknown error key for anything else', () => {
    expect(handleApiError({ unexpected: 'object' })).toStrictEqual({ error: UNKNOWN_API_ERROR });
  });
});

describe('callApi', () => {
  const respond =
    <T,>(data: T) =>
    () =>
      Promise.resolve({ data } as AxiosResponse<T>);

  it('returns the response data', async () => {
    await expect(callApi(respond({ id: 'p1' }))).resolves.toStrictEqual({ data: { id: 'p1' } });
  });

  it('maps the response data to the app model', async () => {
    await expect(callApi(respond({ id: 'p1' }), (pdm) => pdm.id)).resolves.toStrictEqual({
      data: 'p1'
    });
  });

  it.each([undefined, null, ''])(
    'returns the standard error for a response of %j',
    async (data) => {
      await expect(callApi(respond(data))).resolves.toStrictEqual({ error: UNKNOWN_API_ERROR });
    }
  );

  it('returns no data, and no error, for an empty response when that is allowed', async () => {
    await expect(callApi(respond(''), undefined, { allowEmpty: true })).resolves.toStrictEqual({
      data: undefined
    });
  });

  it('returns the error when the response cannot be mapped', async () => {
    const result = await callApi(respond({}), () => {
      throw new Error('Missing prsl_id');
    });
    expect(result).toStrictEqual({ error: 'Missing prsl_id' });
  });

  it('returns the error when the request cannot be made', async () => {
    const result = await callApi(() => {
      throw new Error('Invalid proposal');
    });
    expect(result).toStrictEqual({ error: 'Invalid proposal' });
  });

  it('returns the error for a failed request, through handleApiError', async () => {
    const error = new AxiosError('Request failed', 'ERR_BAD_RESPONSE');
    error.response = {
      status: 500,
      data: { title: 'Internal Server Error', detail: 'ODA unavailable' }
    } as AxiosError['response'];
    await expect(callApi(() => Promise.reject(error))).resolves.toStrictEqual({
      error: 'Internal Server Error: ODA unavailable'
    });
  });
});
