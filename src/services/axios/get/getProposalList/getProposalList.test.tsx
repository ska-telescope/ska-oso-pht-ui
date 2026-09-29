import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import GetProposalList, { mappingList } from './getProposalList';
import MockProposalBackendList from './mockProposalBackendList';
import MockProposalFrontendList from './mockProposalFrontendList';
import Proposal, { ProposalBackend } from '@/utils/types/proposal';
import { getUniqueMostRecentItems } from '@/utils/helpers';
import { PROPOSAL_TYPE } from '@/utils/constants';

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

describe('Helper Functions', () => {
  test('getUniqueMostRecentItems returns most recent items based on specified key', () => {
    const result: ProposalBackend[] = getUniqueMostRecentItems(MockProposalBackendList, 'prsl_id');
    expect(result).to.have.lengthOf(MockProposalBackendList.length);
    expect(result[0].metadata?.last_modified_on).to.equal('2022-09-23T15:43:53.971548Z');
    expect(result[1].metadata?.last_modified_on).to.equal('2022-09-23T15:43:53.971548Z');
  });

  test('mappingList returns mapped proposal list from backend to frontend format', () => {
    const proposalFrontEnd: Proposal[] = mappingList(MockProposalBackendList);
    expect(withoutObservations(proposalFrontEnd)).to.deep.equal(MockProposalFrontendList);
    expect(observationIds(proposalFrontEnd)).to.deep.equal(
      backendObservationIds(MockProposalBackendList)
    );
  });

  test('mappingList passes the science verification type through with no science category', () => {
    const [proposalFrontEnd] = mappingList([
      {
        ...MockProposalBackendList[0],
        proposal_info: {
          ...MockProposalBackendList[0].proposal_info,
          proposal_type: { main_type: PROPOSAL_TYPE.SCIENCE_VERIFICATION, attributes: [] },
          science_category: undefined
        }
      }
    ]);
    expect(proposalFrontEnd.proposalType).to.equal(PROPOSAL_TYPE.SCIENCE_VERIFICATION);
    expect(proposalFrontEnd.proposalSubType).to.deep.equal([]);
    expect(proposalFrontEnd.scienceCategory).to.equal('');
    // The observations are what the observing mode is shown from
    expect(proposalFrontEnd.observations?.map((obs) => obs.type)).to.deep.equal(
      MockProposalBackendList[0].observation_info.observation_sets?.map(
        (set) => set.observation_type_details?.observation_type
      )
    );
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

  test('returns mapped data from API', async () => {
    mockedAuthClient.get.mockResolvedValue({ data: MockProposalBackendList });
    const result = (await GetProposalList(mockedAuthClient)) as Proposal[];
    expect(withoutObservations(result)).to.deep.equal(MockProposalFrontendList);
    expect(observationIds(result)).to.deep.equal(backendObservationIds(MockProposalBackendList));
  });

  test('returns unsorted data when API returns only one proposal', async () => {
    mockedAuthClient.get.mockResolvedValue({ data: [MockProposalBackendList[0]] });
    const result = (await GetProposalList(mockedAuthClient)) as Proposal[];
    expect(withoutObservations(result)).toEqual([MockProposalFrontendList[0]]);
    expect(observationIds(result)).toEqual(backendObservationIds([MockProposalBackendList[0]]));
  });

  test('returns error message on API failure', async () => {
    mockedAuthClient.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetProposalList(mockedAuthClient);
    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    mockedAuthClient.get.mockRejectedValue({ unexpected: 'object' });
    const result = await GetProposalList(mockedAuthClient);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API returns non-array data', async () => {
    mockedAuthClient.get.mockResolvedValue({ data: { not: 'an array' } });
    const result = await GetProposalList(mockedAuthClient);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
