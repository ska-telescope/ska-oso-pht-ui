import { describe, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import GetProposal, { GetMockProposal, mapping } from './getProposal';
import { MockProposalBackend, MockProposalBackendZoom } from './mockProposalBackend';
import { MockProposalFrontend, MockProposalFrontendZoom } from './mockProposalFrontend';
import * as CONSTANTS from '@/utils/constants';
import Proposal from '@/utils/types/proposal';

vi.mock('axios');
const mockedAxios = (axios as unknown) as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  // add other axios methods as needed
};

describe('Helper Functions', () => {
  test('GetMockProposal returns mock proposal', () => {
    const result = GetMockProposal();
    expect(result).to.deep.equal(MockProposalFrontend);
  });

  test('mapping returns mapped continuum proposal from backend to frontend format', () => {
    const proposalFrontEnd: Proposal = mapping(MockProposalBackend);
    expect(proposalFrontEnd).to.deep.equal(MockProposalFrontend);
  });

  test('mapping returns mapped zoom proposal from backend to frontend format', () => {
    const proposalFrontEnd: Proposal = mapping(MockProposalBackendZoom);
    expect(proposalFrontEnd).to.deep.equal(MockProposalFrontendZoom);
  });
});

describe('GetProposal Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetProposal(MockProposalBackend.prsl_id);
    expect(result).toEqual(MockProposalFrontend);
  });

  test('returns mapped data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({ data: MockProposalBackend });
    const result = (await GetProposal(MockProposalBackend.prsl_id)) as Proposal;
    expect(result).to.deep.equal(MockProposalFrontend);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetProposal(MockProposalBackend.prsl_id);
    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockRejectedValue({ unexpected: 'object' });
    const result = await GetProposal(MockProposalBackend.prsl_id);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API returns non-array data', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({ data: { not: 'an array' } });
    const result = await GetProposal(MockProposalBackend.prsl_id);
    expect(result).toContain('Cannot read properties of undefined');
  });

  test('returns error.API_UNKNOWN_ERROR when API returns no data', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue(undefined);
    const result = await GetProposal(MockProposalBackend.prsl_id);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
