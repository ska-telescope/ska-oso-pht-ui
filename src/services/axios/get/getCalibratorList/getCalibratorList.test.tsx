import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import * as CONSTANTS from '@utils/constants.ts';
import GetCalibratorList, { GetMockCalibratorList } from './getCalibratorList';
import { MockCalibratorFrontendList } from './mockCalibratorListFrontend';
// import { MockCalibratorBackendList } from './mockCalibratorListBackend';
// import { Calibrator } from '@/utils/types/calibrationStrategy';

describe('Helper Functions', () => {
  test('GetMockCalibratorList returns mock calibrator list', () => {
    const result = GetMockCalibratorList();
    expect(result).to.have.lengthOf(MockCalibratorFrontendList.length);
    expect(result).to.deep.equal(MockCalibratorFrontendList);
  });
});

describe('GetCalibratorList Service', () => {
  // let mockedAuthClient: any;
  beforeEach(() => {
    // vi.resetAllMocks();
    // mockedAuthClient = {
    //   put: vi.fn(),
    //   get: vi.fn(),
    //   post: vi.fn(),
    //   delete: vi.fn(),
    //   interceptors: {
    //     request: { clear: vi.fn, eject: vi.fn(), use: vi.fn() },
    //     response: { clear: vi.fn, eject: vi.fn(), use: vi.fn() }
    //   }
    //};
  });

  test('returns mapped mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetCalibratorList(/* mockedAuthClient */);
    expect(result).toEqual(MockCalibratorFrontendList);
  });

  // test('returns mapped data from API when USE_LOCAL_DATA is false', async () => {
  //   vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
  //   mockedAuthClient.get.mockResolvedValue({ data: MockCalibratorBackendList });
  //   const result = (await GetCalibratorList(mockedAuthClient)) as Calibrator[];
  //   expect(result).to.deep.equal(MockCalibratorFrontendList);
  // });

  // test('returns error message on API failure', async () => {
  //   vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
  //   mockedAuthClient.get.mockRejectedValue(new Error('Network Error'));
  //   const result = await GetCalibratorList(mockedAuthClient);
  //   expect(result).toBe('Network Error');
  // });

  // test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
  //   vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
  //   mockedAuthClient.get.mockRejectedValue({ unexpected: 'object' });
  //   const result = await GetCalibratorList(mockedAuthClient);
  //   expect(result).toBe('error.API_UNKNOWN_ERROR');
  // });

  // test('returns error.API_UNKNOWN_ERROR when API returns non-array data', async () => {
  //   vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
  //   mockedAuthClient.get.mockResolvedValue({ data: { not: 'an array' } });
  //   const result = await GetCalibratorList(mockedAuthClient);
  //   expect(result).toBe('error.API_UNKNOWN_ERROR');
  // });
});
