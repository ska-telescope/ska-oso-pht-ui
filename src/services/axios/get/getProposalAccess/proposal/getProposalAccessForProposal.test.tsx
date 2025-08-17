import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import MockProposalAccessBackend from '../mockProposalAccessBackend';
import MockProposalAccessFrontend from '../mockProposalAccessFrontend';
import GetProposalAccessForProposal, { GetMockProposalAccessForProposal } from './getProposalAccessForProposal';
import * as CONSTANTS from '@/utils/constants';
import ProposalAccess, { ProposalAccessBackend } from '@/utils/types/proposalAccess';
import { getUniqueMostRecentItems } from '@/utils/helpers';

describe('Helper Functions', () => {
  test('getUniqueMostRecentItems returns most recent items based on specified key', () => {
    const result: ProposalAccessBackend[] = getUniqueMostRecentItems(
      MockProposalAccessBackend,
      'prsl_id'
    );
    expect(result).to.have.lengthOf(MockProposalAccessBackend.length);
  });

  test('GetMockProposalAccessForProposal returns mock proposal access', () => {
    const result = GetMockProposalAccessForProposal();
    expect(result).to.have.lengthOf(MockProposalAccessFrontend.length);
    expect(result).to.deep.equal(MockProposalAccessFrontend);
  });
});

describe('GetProposalAccessForProposal Service', () => {
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

  const mockProposalId = 'prsl-t0001-20250814-00002';

  test('returns mapped mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetProposalAccessForProposal(mockedAuthClient, mockProposalId);
    expect(result).toEqual(MockProposalAccessFrontend);
  });

  test('returns mapped data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: MockProposalAccessBackend });
    const result = (await GetProposalAccessForProposal(mockedAuthClient, mockProposalId)) as ProposalAccess[];
    expect(result).to.deep.equal(MockProposalAccessFrontend);
  });

  test('returns unsorted data when API returns only one proposal', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: [MockProposalAccessBackend[0]] });
    const result = await GetProposalAccessForProposal(mockedAuthClient, mockProposalId);
    expect(result).toEqual([MockProposalAccessFrontend[0]]);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetProposalAccessForProposal(mockedAuthClient, mockProposalId);
    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue({ unexpected: 'object' });
    const result = await GetProposalAccessForProposal(mockedAuthClient, mockProposalId);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API returns non-array data', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: { not: 'an array' } });
    const result = await GetProposalAccessForProposal(mockedAuthClient, mockProposalId);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
