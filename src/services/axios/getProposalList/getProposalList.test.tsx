import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import axios from 'axios';
import GetProposalList, {
  GetMockProposalList,
  sortByLastUpdated,
  mappingList
} from './getProposalList';
import MockProposalBackendList from './mockProposalBackendList';
import MockProposalFrontendList from './mockProposalFrontendList';
import * as CONSTANTS from '@/utils/constants';
import Proposal, { ProposalBackend } from '@/utils/types/proposal';

const mockedAxios = (axios as unknown) as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  // add other axios methods as needed
};

describe('Helper Functions', () => {
  test('sortByLastUpdated returns proposals sorted by last updated date', () => {
    const result: ProposalBackend[] = sortByLastUpdated(MockProposalBackendList);
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
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('returns mapped mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetProposalList();
    expect(result).toEqual(MockProposalFrontendList);
  });

  test('returns mapped data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({ data: MockProposalBackendList });
    const result = (await GetProposalList()) as Proposal[];
    expect(result).to.deep.equal(MockProposalFrontendList);
  });

  test('returns unsorted data when API returns only one proposal', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({ data: [MockProposalBackendList[0]] });
    const result = await GetProposalList();
    expect(result).toEqual([MockProposalFrontendList[0]]);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetProposalList();
    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockRejectedValue({ unexpected: 'object' });
    const result = await GetProposalList();
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API returns non-array data', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({ data: { not: 'an array' } });
    const result = await GetProposalList();
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
