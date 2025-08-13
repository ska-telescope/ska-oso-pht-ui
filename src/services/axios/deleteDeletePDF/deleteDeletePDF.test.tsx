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

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    mockedAuthClient.delete.mockResolvedValue(undefined);
    const result = await DeleteDeletePDF('dummy-url');
    expect(result).to.deep.equal('error.API_UNKNOWN_ERROR');
  });
});
