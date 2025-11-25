import { describe, test, expect, vi, beforeEach } from 'vitest';
import * as CONSTANTS from '@utils/constants.ts';
import Proposal from '@utils/types/proposal.tsx';
import GetProposal, { GetMockProposal, mapping } from './getProposal.tsx';
import { MockProposalBackend, MockProposalBackendZoom } from './mockProposalBackend.tsx';
import {
  MockNullProposalFrontend,
  MockProposalFrontend,
  MockProposalFrontendZoom
} from './mockProposalFrontend.tsx';

describe('Helper Functions', () => {
  test('GetMockProposal returns mock proposal', () => {
    const result = GetMockProposal();
    expect(result).to.deep.equal(MockProposalFrontend);
  });

  test('mapping returns mapped continuum proposal from backend to frontend format', () => {
    const proposalFrontEnd: Proposal = mapping(MockProposalBackend);
    expect(proposalFrontEnd).to.deep.equal(MockProposalFrontend);
  });

  test.skip('mapping returns mapped zoom proposal from backend to frontend format', () => {
    const proposalFrontEnd: Proposal = mapping(MockProposalBackendZoom);
    expect(proposalFrontEnd).to.deep.equal(MockProposalFrontendZoom);
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
    const result = await GetProposal(mockedAuthClient, MockProposalBackend.prsl_id);
    expect(result).toEqual(MockProposalFrontend);
  });

  test('returns mapped data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: MockProposalBackend });
    const result = (await GetProposal(mockedAuthClient, MockProposalBackend.prsl_id)) as Proposal;
    expect(result).to.deep.equal(MockProposalFrontend);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetProposal(mockedAuthClient, MockProposalBackend.prsl_id);
    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue({ unexpected: 'object' });
    const result = await GetProposal(mockedAuthClient, MockProposalBackend.prsl_id);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test("mapping doesn't crash when receiving unexpected data", async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: { not: 'expected' } });
    const result = await GetProposal(mockedAuthClient, MockProposalBackend.prsl_id);
    expect(result).toEqual(MockNullProposalFrontend);
  });

  test('returns error.API_UNKNOWN_ERROR when API returns no data', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue(undefined);
    const result = await GetProposal(mockedAuthClient, MockProposalBackend.prsl_id);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});

const OBSERVATION = {
  ObservingMode: [
    { label: 'Mode A', value: 1 },
    { label: 'Mode B', value: 2 },
    { label: 'Mode C', value: 3 }
  ]
};

const getObservingMode = (scienceCat: string) => {
  const cat = OBSERVATION.ObservingMode?.find(
    cat => cat.label.toLowerCase() === scienceCat?.toLowerCase()
  )?.value;
  return cat ? cat : null;
};

describe('getObservingMode', () => {
  test('returns correct value for a valid observing mode', () => {
    expect(getObservingMode('Mode A')).toBe(1);
    expect(getObservingMode('mode b')).toBe(2);
    expect(getObservingMode('MODE C')).toBe(3);
  });

  test('returns null for an invalid observing mode', () => {
    expect(getObservingMode('Invalid Mode')).toBeNull();
    expect(getObservingMode('')).toBeNull();
    expect(getObservingMode((null as unknown) as string)).toBeNull();
  });

  test('is case insensitive', () => {
    expect(getObservingMode('mode a')).toBe(1);
    expect(getObservingMode('MODE B')).toBe(2);
  });
});
