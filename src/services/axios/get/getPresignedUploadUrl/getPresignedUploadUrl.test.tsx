import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as constants from '@utils/constants';
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

  it('returns dummy upload URL when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetPresignedUploadUrl(mockedAuthClient, filename);
    expect(result).toBe('https://httpbin.org/put');
  });

  it('returns result.data when post succeeds', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    vi.spyOn(constants, 'S3_SIGNED_URL_OVERRIDE', 'get').mockReturnValue('');
    mockedAuthClient.post.mockResolvedValue({ data: 'upload-url-success' });

    const result = await GetPresignedUploadUrl(mockedAuthClient, filename);
    expect(result).toBe('upload-url-success');
  });

  it('rewrites signed URL when S3_SIGNED_URL_OVERRIDE is set', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    vi.spyOn(constants, 'S3_SIGNED_URL_OVERRIDE', 'get').mockReturnValue('/s3mock');
    vi.spyOn(constants, 'S3_SIGNED_URL_BUCKET_REWRITE_FROM', 'get').mockReturnValue('');
    vi.spyOn(constants, 'S3_SIGNED_URL_BUCKET_REWRITE_TO', 'get').mockReturnValue('');
    mockedAuthClient.post.mockResolvedValue({
      data: 'https://s3.amazonaws.com/test-bucket/upload.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256'
    });

    const result = await GetPresignedUploadUrl(mockedAuthClient, filename);
    expect(result).toBe('/s3mock/test-bucket/upload.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256');
  });

  it('rewrites bucket segment before applying S3_SIGNED_URL_OVERRIDE', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    vi.spyOn(constants, 'S3_SIGNED_URL_OVERRIDE', 'get').mockReturnValue('/s3mock');
    vi.spyOn(constants, 'S3_SIGNED_URL_BUCKET_REWRITE_FROM', 'get').mockReturnValue(
      'local_s3_bucket_name'
    );
    vi.spyOn(constants, 'S3_SIGNED_URL_BUCKET_REWRITE_TO', 'get').mockReturnValue(
      'local-s3-bucket-name'
    );
    mockedAuthClient.post.mockResolvedValue({
      data: 'https://s3.amazonaws.com/local_s3_bucket_name/upload.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256'
    });

    const result = await GetPresignedUploadUrl(mockedAuthClient, filename);
    expect(result).toBe(
      '/s3mock/local-s3-bucket-name/upload.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256'
    );
  });

  it('moves a virtual-hosted bucket into the path for S3Mock', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    vi.spyOn(constants, 'S3_SIGNED_URL_OVERRIDE', 'get').mockReturnValue('/s3mock');
    vi.spyOn(constants, 'S3_SIGNED_URL_BUCKET_REWRITE_FROM', 'get').mockReturnValue(
      'local_s3_bucket_name'
    );
    vi.spyOn(constants, 'S3_SIGNED_URL_BUCKET_REWRITE_TO', 'get').mockReturnValue(
      'local-s3-bucket-name'
    );
    mockedAuthClient.post.mockResolvedValue({
      data: 'https://local_s3_bucket_name.s3.amazonaws.com/upload.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256'
    });

    const result = await GetPresignedUploadUrl(mockedAuthClient, filename);
    expect(result).toBe(
      '/s3mock/local-s3-bucket-name/upload.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256'
    );
  });

  it('adds the configured S3Mock bucket when the signed URL omits it', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    vi.spyOn(constants, 'S3_SIGNED_URL_OVERRIDE', 'get').mockReturnValue('/s3mock');
    vi.spyOn(constants, 'S3_SIGNED_URL_BUCKET_REWRITE_FROM', 'get').mockReturnValue(
      'local_s3_bucket_name'
    );
    vi.spyOn(constants, 'S3_SIGNED_URL_BUCKET_REWRITE_TO', 'get').mockReturnValue(
      'local-s3-bucket-name'
    );
    mockedAuthClient.post.mockResolvedValue({
      data: 'https://s3.amazonaws.com/upload.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256'
    });

    const result = await GetPresignedUploadUrl(mockedAuthClient, filename);
    expect(result).toBe(
      '/s3mock/local-s3-bucket-name/upload.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256'
    );
  });

  it('returns API_UNKNOWN_ERROR when post returns undefined', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockResolvedValue(undefined);

    const result = await GetPresignedUploadUrl(mockedAuthClient, filename);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  it('returns error message when post throws an Error', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockRejectedValue(new Error('Upload failed'));

    const result = await GetPresignedUploadUrl(mockedAuthClient, filename);
    expect(result).toBe('Upload failed');
  });

  it('returns generic error when post throws non-Error', async () => {
    vi.spyOn(constants, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockRejectedValue('unexpected string');

    const result = await GetPresignedUploadUrl(mockedAuthClient, filename);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
