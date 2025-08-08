import { beforeEach, describe, expect, test, vi } from 'vitest';
import * as CONSTANTS from '@utils/constants.ts';
import DeleteDeletePDF from '@services/axios/deleteDeletePDF/deleteDeletePDF.tsx';

describe('DeleteDeletePDF Service', () => {
  let mockedAuthClient: any;
  beforeEach(() => {
    vi.resetAllMocks();
    mockedAuthClient = {
      delete: vi.fn()
    };
  });

  test('returns mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await DeleteDeletePDF('dummy-url');
    expect(result).toEqual('https://httpbin.org/delete');
  });

  test('returns error.API_UNKNOWN_ERROR when API returns no data', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.delete.mockResolvedValue({
      signedUrl: 'dummy-url',
      selectedFile: 'test-file.txt'
    });
    const result = await DeleteDeletePDF('dummy-url');
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
