import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as constants from '@utils/constants';
import GetPresignedDownloadUrl from './getPresignedDownloadUrl';

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

describe('GetPresignedDownloadUrl', () => {
  const selectedFile = 'example.pdf';

  it('returns dummy download URL when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetPresignedDownloadUrl(mockedAuthClient, selectedFile);
    expect(result).toBe('https://dagrs.berkeley.edu/sites/default/files/2020-01/sample.pdf');
  });

  it('returns result.data when post succeeds', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    vi.spyOn(constants, 'S3_SIGNED_URL_OVERRIDE', 'get').mockReturnValue('');
    mockedAuthClient.post.mockResolvedValue({ data: 'download-url-success' });

    const result = await GetPresignedDownloadUrl(mockedAuthClient, selectedFile);
    expect(result).toBe('download-url-success');
  });

  it('rewrites signed URL when S3_SIGNED_URL_OVERRIDE is set', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    vi.spyOn(constants, 'S3_SIGNED_URL_OVERRIDE', 'get').mockReturnValue('/s3mock');
    mockedAuthClient.post.mockResolvedValue({
      data: 'https://s3.amazonaws.com/test-bucket/download.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256'
    });

    const result = await GetPresignedDownloadUrl(mockedAuthClient, selectedFile);
    expect(result).toBe('/s3mock/test-bucket/download.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256');
  });

  it('returns API_UNKNOWN_ERROR when post returns undefined', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockResolvedValue(undefined);

    const result = await GetPresignedDownloadUrl(mockedAuthClient, selectedFile);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  it('returns error message when post throws an Error', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockRejectedValue(new Error('Download failed'));

    const result = await GetPresignedDownloadUrl(mockedAuthClient, selectedFile);
    expect(result).toBe('Download failed');
  });

  it('returns generic error when post throws non-Error', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockRejectedValue('unexpected string');

    const result = await GetPresignedDownloadUrl(mockedAuthClient, selectedFile);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
