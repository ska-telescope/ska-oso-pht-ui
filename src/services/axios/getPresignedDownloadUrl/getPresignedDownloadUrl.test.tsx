import { beforeEach, describe, expect, test, vi } from 'vitest';
import GetPresignedDownloadUrl from '@services/axios/getPresignedDownloadUrl/getPresignedDownloadUrl.tsx';

describe('GetPresignedDownloadUrl Service', () => {
  let mockedAuthClient: any;
  beforeEach(() => {
    vi.resetAllMocks();
    mockedAuthClient = {
      post: vi.fn()
    };
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    mockedAuthClient.post.mockResolvedValue(undefined);
    const result = await GetPresignedDownloadUrl(mockedAuthClient, 'filename.txt');
    expect(result).to.deep.equal('error.API_UNKNOWN_ERROR');
  });
});
