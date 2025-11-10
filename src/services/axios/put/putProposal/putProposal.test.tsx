import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import { PROPOSAL_STATUS } from '@utils/constants.ts';
import * as CONSTANTS from '@utils/constants.ts';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { MockProposalFrontend, MockProposalFrontendZoom } from './mockProposalFrontend.tsx';
import { MockProposalBackend, MockProposalBackendZoom } from './mockProposalBackend.tsx';
import PutProposal, { mockPutProposal } from './putProposal.tsx';
import MappingPutProposal from './putProposalMapping.tsx';

describe('Helper Functions', () => {
  test('mockPutProposal returns mock proposal', () => {
    const result = mockPutProposal();
    expect(result).to.deep.equal(MockProposalBackend);
  });

  test('mappingPutProposal returns mapped proposal from frontend to backend format', () => {
    const proposalBackEnd: ProposalBackend = MappingPutProposal(
      MockProposalFrontend,
      false,
      PROPOSAL_STATUS.DRAFT
    );
    expect(proposalBackEnd).to.deep.equal(MockProposalBackend);
  });

  test('mappingPutProposal returns mapped proposal with zoom observation from frontend to backend format', () => {
    const proposalBackEnd: ProposalBackend = MappingPutProposal(
      MockProposalFrontendZoom,
      false,
      PROPOSAL_STATUS.DRAFT
    );
    expect(proposalBackEnd).to.deep.equal(MockProposalBackendZoom);
  });

  test('mappingPutProposal returns mapped proposal and returns empty array of sub-type when not specified', () => {
    const proposal = { ...MockProposalFrontend, proposalSubType: undefined };
    const proposalBackEnd: ProposalBackend = MappingPutProposal(
      proposal,
      false,
      PROPOSAL_STATUS.DRAFT
    );
    expect(proposalBackEnd).to.deep.equal({
      ...MockProposalBackend,
      proposal_info: {
        ...MockProposalBackend.proposal_info,
        proposal_type: { ...MockProposalBackend.proposal_info.proposal_type, attributes: [] }
      }
    });
  });
});

describe('PutProposal Service', () => {
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

  test('returns mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await PutProposal(
      mockedAuthClient,
      MockProposalFrontend,
      false,
      PROPOSAL_STATUS.DRAFT
    );
    expect(result).to.deep.equal(MockProposalBackend);
  });

  test('returns data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockResolvedValue({ data: MockProposalBackend });
    const result = await PutProposal(
      mockedAuthClient,
      MockProposalFrontend,
      false,
      PROPOSAL_STATUS.DRAFT
    );
    expect(result).to.deep.equal(MockProposalBackend);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockRejectedValue(new Error('Network Error'));
    const result = await PutProposal(
      mockedAuthClient,
      MockProposalFrontend,
      false,
      PROPOSAL_STATUS.DRAFT
    );
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockRejectedValue({ unexpected: 'object' });
    const result = await PutProposal(
      mockedAuthClient,
      MockProposalFrontend,
      false,
      PROPOSAL_STATUS.DRAFT
    );
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockResolvedValue(undefined);
    const result = await PutProposal(
      mockedAuthClient,
      MockProposalFrontend,
      false,
      PROPOSAL_STATUS.DRAFT
    );
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result null', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockResolvedValue(null);
    const result = await PutProposal(
      mockedAuthClient,
      MockProposalFrontend,
      false,
      PROPOSAL_STATUS.DRAFT
    );
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
