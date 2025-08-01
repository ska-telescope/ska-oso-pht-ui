import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import GetProposalList, { GetMockProposalList, mappingList } from './getProposalList';
import MockProposalBackendList from './mockProposalBackendList';
import MockProposalFrontendList from './mockProposalFrontendList';
import * as CONSTANTS from '@/utils/constants';
import Proposal, { ProposalBackend } from '@/utils/types/proposal';
import { getMostRecentItems } from '@/utils/helpers';

describe('Helper Functions', () => {
  test('getMostRecentItems returns most recent items based on specified key', () => {
    const result: ProposalBackend[] = getMostRecentItems(MockProposalBackendList, 'prsl_id');
    expect(result).to.have.lengthOf(MockProposalBackendList.length);
    expect(result[0].metadata?.last_modified_on).to.equal('2022-09-23T15:43:53.971548Z');
    expect(result[1].metadata?.last_modified_on).to.equal('2022-09-23T15:43:53.971548Z');
  });

  test('GetMockProposalList returns mock proposal list', () => {
    const result = GetMockProposalList();
    expect(result).to.have.lengthOf(MockProposalFrontendList.length);
    expect(result).to.deep.equal(MockProposalFrontendList);
  });

  test('mappingList returns mapped proposal list from backend to frontend format', () => {
    const proposalFrontEnd: Proposal[] = mappingList(MockProposalBackendList);
    expect(proposalFrontEnd).to.deep.equal(MockProposalFrontendList);
  });
});

describe('GetProposalList Service', () => {
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

  test('returns mapped mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetProposalList(mockedAuthClient);
    expect(result).toEqual(MockProposalFrontendList);
  });

  test('returns mapped data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: MockProposalBackendList });
    const result = (await GetProposalList(mockedAuthClient)) as Proposal[];
    expect(result).to.deep.equal(MockProposalFrontendList);
  });

  test('returns unsorted data when API returns only one proposal', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: [MockProposalBackendList[0]] });
    const result = await GetProposalList(mockedAuthClient);
    expect(result).toEqual([MockProposalFrontendList[0]]);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetProposalList(mockedAuthClient);
    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue({ unexpected: 'object' });
    const result = await GetProposalList(mockedAuthClient);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API returns non-array data', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: { not: 'an array' } });
    const result = await GetProposalList(mockedAuthClient);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
