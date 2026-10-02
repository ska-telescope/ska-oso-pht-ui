import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import Proposal, { ProposalBackend } from '@utils/types/proposal.tsx';
import MockProposalBackendList from '../getProposalList/mockProposalBackendList.tsx';
import MockProposalFrontendList from '../getProposalList/mockProposalFrontendList.tsx';
import GetProposalsReviewable from './getProposalsReviewable.tsx';

// The list maps every proposal's observations. The fixture leaves them out to stay readable,
// so they are compared separately, against the backend's observation sets.
const withoutObservations = (proposals: Proposal[]) =>
  proposals.map((proposal) => {
    const rest = { ...proposal };
    delete rest.observations;
    return rest;
  });

const observationIds = (proposals: Proposal[]) =>
  proposals.map((proposal) => proposal.observations?.map((observation) => observation.id));

const backendObservationIds = (proposals: ProposalBackend[]) =>
  proposals.map((proposal) =>
    proposal.observation_info.observation_sets?.map((set) => set.observation_set_id)
  );

describe('GetProposalsReviewable Service', () => {
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
    mockedAuthClient.get.mockResolvedValue({ data: MockProposalBackendList });
    const result = (await GetProposalsReviewable(mockedAuthClient)) as Proposal[];
    expect(withoutObservations(result)).to.deep.equal(MockProposalFrontendList);
    expect(observationIds(result)).to.deep.equal(backendObservationIds(MockProposalBackendList));
  });

  test('returns unsorted data when API returns only one proposal', async () => {
    mockedAuthClient.get.mockResolvedValue({ data: [MockProposalBackendList[0]] });
    const result = (await GetProposalsReviewable(mockedAuthClient)) as Proposal[];
    expect(withoutObservations(result)).toEqual([MockProposalFrontendList[0]]);
    expect(observationIds(result)).toEqual(backendObservationIds([MockProposalBackendList[0]]));
  });

  test('returns error message on API failure', async () => {
    mockedAuthClient.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetProposalsReviewable(mockedAuthClient);
    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    mockedAuthClient.get.mockRejectedValue({ unexpected: 'object' });
    const result = await GetProposalsReviewable(mockedAuthClient);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API returns non-array data', async () => {
    mockedAuthClient.get.mockResolvedValue({ data: { not: 'an array' } });
    const result = await GetProposalsReviewable(mockedAuthClient);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
