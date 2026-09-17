import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import Investigator from '@utils/types/investigator.tsx';
import GetUserByEmail, { mapping } from './getUserByEmail.tsx';
import { MockUserFrontendList } from './mockUserFrontend.tsx';
import { MockUserMSGraphList } from './mockUserMSGraph.tsx';

// finds a mapped user by email (case-insensitive), mirroring how the real API is expected to resolve
// a single user by email - used only to exercise that lookup behaviour against the mock team list
function findMockUserByEmail(email: string): Investigator | string {
  const teamList: Investigator[] = MockUserMSGraphList.map(mapping);
  const user = teamList.find((user) => user?.email?.toLowerCase() === email?.toLowerCase());
  return user ?? 'error.API_UNKNOWN_ERROR';
}

describe('Helper Functions', () => {
  test('findMockUserByEmail returns mock user', () => {
    const result = findMockUserByEmail(MockUserMSGraphList[0].email);
    expect(result).to.deep.equal(MockUserFrontendList[0]);
    const result2 = findMockUserByEmail(MockUserMSGraphList[1].email);
    expect(result2).to.deep.equal(MockUserFrontendList[1]);
  });

  test('findMockUserByEmail returns correct mock user when case not matching', () => {
    const result = findMockUserByEmail('sarah.SATTAR@community.skao.int');
    expect(result).to.deep.equal(MockUserFrontendList[0]);
  });

  test('findMockUserByEmail returns error when user not in stargazer mocked list', () => {
    const result = findMockUserByEmail('someone.else@community.skao.int');
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

  test('returns mapped data from API', async () => {
    mockedAuthClient.get.mockResolvedValue({ data: MockUserMSGraphList[1] });
    const result = await GetUserByEmail(mockedAuthClient, 'trevor.swain@community.skao.int');
    expect(result).to.deep.equal(MockUserFrontendList[1]);
  });

  test('returns error message on API failure', async () => {
    mockedAuthClient.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetUserByEmail(mockedAuthClient, 'Jack.Tam@community.skao.int');
    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    mockedAuthClient.get.mockRejectedValue({ unexpected: 'object' });
    const result = await GetUserByEmail(mockedAuthClient, 'Chloe.Gallacher@community.skao.int');
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API returns non-object data', async () => {
    mockedAuthClient.get.mockResolvedValue({ data: 'not an object' });
    const result = await GetUserByEmail(mockedAuthClient, 'Tonye.Irabor@community.skao.int');
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API returns no data', async () => {
    mockedAuthClient.get.mockResolvedValue(undefined);
    const result = await GetUserByEmail(mockedAuthClient, 'Meenu.Mohan@assoc.skao.int');
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
