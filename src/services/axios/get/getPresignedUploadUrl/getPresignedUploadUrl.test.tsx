import { describe, it, expect, vi, beforeEach } from 'vitest';
import GetPresignedUploadUrl from './getPresignedUploadUrl';

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

describe('GetPresignedUploadUrl', () => {
  const filename = 'upload.pdf';

  it('returns result.data when post succeeds', async () => {
    mockedAuthClient.post.mockResolvedValue({ data: 'upload-url-success' });

    const result = await GetPresignedUploadUrl(mockedAuthClient, filename);
    expect(result).toBe('upload-url-success');
  });

  it('returns API_UNKNOWN_ERROR when post returns undefined', async () => {
    mockedAuthClient.post.mockResolvedValue(undefined);

    const result = await GetPresignedUploadUrl(mockedAuthClient, filename);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  it('returns error message when post throws an Error', async () => {
    mockedAuthClient.post.mockRejectedValue(new Error('Upload failed'));

    const result = await GetPresignedUploadUrl(mockedAuthClient, filename);
    expect(result).toBe('Upload failed');
  });

  it('returns generic error when post throws non-Error', async () => {
    mockedAuthClient.post.mockRejectedValue('unexpected string');

    const result = await GetPresignedUploadUrl(mockedAuthClient, filename);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
