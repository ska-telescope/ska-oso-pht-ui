import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import MockProposalAccessBackend from '../mockProposalAccessBackend';
import MockProposalAccessFrontend from '../mockProposalAccessFrontend';
import GetProposalAccessForUser, { GetMockProposalAccessForUser } from './getProposalAccessForUser';
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

  test('GetMockProposalAccessForUser returns mock proposal access', () => {
    const result = GetMockProposalAccessForUser();
    expect(result).to.have.lengthOf(MockProposalAccessFrontend.length);
    expect(result).to.deep.equal(MockProposalAccessFrontend);
  });
});

describe('GetProposalAccessForUser Service', () => {
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
    mockedAuthClient.get.mockResolvedValue({ data: MockProposalAccessBackend });
    const result = (await GetProposalAccessForUser(mockedAuthClient)) as ProposalAccess[];
    expect(result).to.deep.equal(MockProposalAccessFrontend);
  });

  test('returns unsorted data when API returns only one proposal', async () => {
    mockedAuthClient.get.mockResolvedValue({ data: [MockProposalAccessBackend[0]] });
    const result = await GetProposalAccessForUser(mockedAuthClient);
    expect(result).toEqual([MockProposalAccessFrontend[0]]);
  });

  test('returns error message on API failure', async () => {
    mockedAuthClient.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetProposalAccessForUser(mockedAuthClient);
    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    mockedAuthClient.get.mockRejectedValue({ unexpected: 'object' });
    const result = await GetProposalAccessForUser(mockedAuthClient);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API returns non-array data', async () => {
    mockedAuthClient.get.mockResolvedValue({ data: { not: 'an array' } });
    const result = await GetProposalAccessForUser(mockedAuthClient);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
