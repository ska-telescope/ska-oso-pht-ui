import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import MockProposalBackendList from '../getProposalList/mockProposalBackendList';
import MockProposalFrontendList from '../getProposalList/mockProposalFrontendList';
import GetProposalByStatusList from './getProposalByStatusList';
import * as CONSTANTS from '@/utils/constants';
import Proposal from '@/utils/types/proposal';
import { PROPOSAL_STATUS } from '@/utils/constants';

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
    const result = await GetProposalByStatusList(mockedAuthClient, PROPOSAL_STATUS.DRAFT);
    expect(result).toEqual(MockProposalFrontendList);
  });

  test('returns mapped data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: MockProposalBackendList });
    const result = (await GetProposalByStatusList(
      mockedAuthClient,
      PROPOSAL_STATUS.DRAFT
    )) as Proposal[];
    expect(result).to.deep.equal(MockProposalFrontendList);
  });

  test('returns unsorted data when API returns only one proposal', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: [MockProposalBackendList[0]] });
    const result = await GetProposalByStatusList(mockedAuthClient, PROPOSAL_STATUS.DRAFT);
    expect(result).toEqual([MockProposalFrontendList[0]]);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetProposalByStatusList(mockedAuthClient, PROPOSAL_STATUS.DRAFT);
    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue({ unexpected: 'object' });
    const result = await GetProposalByStatusList(mockedAuthClient, PROPOSAL_STATUS.DRAFT);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API returns non-array data', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: { not: 'an array' } });
    const result = await GetProposalByStatusList(mockedAuthClient, PROPOSAL_STATUS.DRAFT);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
