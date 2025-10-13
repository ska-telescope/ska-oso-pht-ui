import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import * as CONSTANTS from '@utils/constants.ts';
import GetUserByEmail, { GetMockUserByEmail, mapping } from './getUserByEmail.tsx';
import { MockUserFrontendList } from './mockUserFrontend.tsx';
import { MockUserMSGraphList } from './mockUserMSGraph.tsx';

describe('Helper Functions', () => {
  test('GetMockUserByEmail returns mock user', () => {
    const result = GetMockUserByEmail(MockUserMSGraphList[0].email);
    expect(result).to.deep.equal(MockUserFrontendList[0]);
    const result2 = GetMockUserByEmail(MockUserMSGraphList[1].email);
    expect(result2).to.deep.equal(MockUserFrontendList[1]);
  });

  test('GetMockUserByEmail returns correct mock user when case not matching', () => {
    const result = GetMockUserByEmail('sarah.SATTAR@community.skao.int');
    expect(result).to.deep.equal(MockUserFrontendList[0]);
  });

  test('GetMockUserByEmail returns error when user not in stargazer mocked list', () => {
    const result = GetMockUserByEmail('someone.else@community.skao.int');
    expect(result).to.equal('error.API_UNKNOWN_ERROR');
  });

  test('mapping user list returns mapped users from MSGraph to frontend format', () => {
    const userBackendList = MockUserMSGraphList;
    const userFrontendList = userBackendList.map(mapping);
    expect(userFrontendList).to.deep.equal(MockUserFrontendList);
  });
});

describe('GetProposal Service', () => {
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

  test('should return mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetUserByEmail(mockedAuthClient, 'sarah.sattar@community.skao.int');
    expect(result).toEqual(MockUserFrontendList[0]);
  });

  test('returns mapped data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: MockUserMSGraphList[1] });
    const result = await GetUserByEmail(mockedAuthClient, 'trevor.swain@community.skao.int');
    expect(result).to.deep.equal(MockUserFrontendList[1]);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetUserByEmail(mockedAuthClient, 'Jack.Tam@community.skao.int');
    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue({ unexpected: 'object' });
    const result = await GetUserByEmail(mockedAuthClient, 'Chloe.Gallacher@community.skao.int');
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API returns non-object data', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: 'not an object' });
    const result = await GetUserByEmail(mockedAuthClient, 'Tonye.Irabor@community.skao.int');
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API returns no data', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue(undefined);
    const result = await GetUserByEmail(mockedAuthClient, 'Meenu.Mohan@assoc.skao.int');
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
