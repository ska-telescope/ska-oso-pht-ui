import { beforeEach, describe, expect, test, vi } from 'vitest';
import * as CONSTANTS from '@utils/constants.ts';
import PutUploadPDF from '@services/axios/putUploadPDF/putUploadPDF.tsx';

describe('PutUploadPDF Service', () => {
  let mockedAuthClient: any;
  beforeEach(() => {
    vi.resetAllMocks();
    mockedAuthClient = {
      put: vi.fn()
    };
  });

  test('returns mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await PutUploadPDF('dummy-url', 'test-file.txt');
    expect(result).toEqual('https://httpbin.org/put');
  });

  test('returns error.API_UNKNOWN_ERROR when API returns no data', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockResolvedValue({
      signedUrl: 'dummy-url',
      selectedFile: 'test-file.txt'
    });
    const result = await PutUploadPDF('dummy-url', 'test-file.txt');
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
