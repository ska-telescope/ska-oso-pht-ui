import { beforeEach, describe, expect, test, vi } from 'vitest';
import GetPresignedDeleteUrl from '@services/axios/getPresignedDeleteUrl/getPresignedDeleteUrl.tsx';

describe('GetPresignedDeleteUrl Service', () => {
  let mockedAuthClient: any;
  beforeEach(() => {
    vi.resetAllMocks();
    mockedAuthClient = {
      post: vi.fn()
    };
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    mockedAuthClient.post.mockResolvedValue(undefined);
    const result = await GetPresignedDeleteUrl(mockedAuthClient, 'filename.txt');
    expect(result).to.deep.equal('error.API_UNKNOWN_ERROR');
  });
});
