import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as constants from '@utils/constants';
import GetPresignedDeleteUrl from './getPresignedDeleteUrl';

let mockedAuthClient: any;

beforeEach(() => {
  vi.resetAllMocks();
  mockedAuthClient = {
    put: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { clear: vi.fn, eject: vi.fn(), use: vi.fn() },
      response: { clear: vi.fn, eject: vi.fn(), use: vi.fn() }
    }
  };
});

describe('GetPresignedDeleteUrl', () => {
  const selectedFile = 'test.pdf';

  it('returns dummy delete URL when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetPresignedDeleteUrl(mockedAuthClient, selectedFile);
    expect(result).toBe('https://httpbin.org/delete');
  });

  it('returns result.data when post succeeds', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockResolvedValue({ data: 'delete-url-success' });

    const result = await GetPresignedDeleteUrl(mockedAuthClient, selectedFile);
    expect(result).toBe('delete-url-success');
  });

  it('returns API_UNKNOWN_ERROR when post returns undefined', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockResolvedValue(undefined);

    const result = await GetPresignedDeleteUrl(mockedAuthClient, selectedFile);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  it('returns error message when post throws an Error', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockRejectedValue(new Error('Delete failed'));

    const result = await GetPresignedDeleteUrl(mockedAuthClient, selectedFile);
    expect(result).toBe('Delete failed');
  });

  it('returns generic error when post throws non-Error', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockRejectedValue('unexpected string');

    const result = await GetPresignedDeleteUrl(mockedAuthClient, selectedFile);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
