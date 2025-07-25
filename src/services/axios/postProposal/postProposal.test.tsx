import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import PostProposal, { mappingPostProposal, mockPostProposal } from './postProposal';
import { MockProposalFrontend } from './mockProposalFrontend';
import { MockProposalBackend } from './mockProposalBackend';
import { ProposalBackend } from '@/utils/types/proposal';
import { PROPOSAL_STATUS } from '@/utils/constants';
import * as CONSTANTS from '@/utils/constants';

describe('Helper Functions', () => {
  test('mockPostProposal returns mock id', () => {
    const result = mockPostProposal();
    expect(result).to.equal('PROPOSAL-ID-001');
  });

  test('mappingPostProposal returns mapped proposal from frontend to backend format', () => {
    const proposalBackEnd: ProposalBackend = mappingPostProposal(
      MockProposalFrontend,
      PROPOSAL_STATUS.DRAFT
    );
    expect(proposalBackEnd).to.deep.equal(MockProposalBackend);
  });

  test('mappingPostProposal returns mapped proposal and returns empty array of sub-type when not specified', () => {
    const proposal = { ...MockProposalFrontend, proposalSubType: undefined };
    const proposalBackEnd: ProposalBackend = mappingPostProposal(proposal, PROPOSAL_STATUS.DRAFT);
    expect(proposalBackEnd).to.deep.equal({
      ...MockProposalBackend,
      info: {
        ...MockProposalBackend.info,
        proposal_type: { ...MockProposalBackend.info.proposal_type, attributes: [] }
      }
    });
  });
});

describe('PostProposal Service', () => {
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

  test('returns mock data id when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await PostProposal(
      mockedAuthClient,
      MockProposalFrontend,
      PROPOSAL_STATUS.DRAFT
    );
    expect(result).toEqual('PROPOSAL-ID-001');
  });

  test('returns data id from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockResolvedValue({ data: MockProposalBackend.prsl_id });
    const result = (await PostProposal(
      mockedAuthClient,
      MockProposalFrontend,
      PROPOSAL_STATUS.DRAFT
    )) as string;
    expect(result).to.deep.equal(MockProposalBackend.prsl_id);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockRejectedValue(new Error('Network Error'));
    const result = await PostProposal(
      mockedAuthClient,
      MockProposalFrontend,
      PROPOSAL_STATUS.DRAFT
    );
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockRejectedValue({ unexpected: 'object' });
    const result = await PostProposal(
      mockedAuthClient,
      MockProposalFrontend,
      PROPOSAL_STATUS.DRAFT
    );
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockResolvedValue(undefined);
    const result = await PostProposal(
      mockedAuthClient,
      MockProposalFrontend,
      PROPOSAL_STATUS.DRAFT
    );
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result null', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockResolvedValue(null);
    const result = await PostProposal(
      mockedAuthClient,
      MockProposalFrontend,
      PROPOSAL_STATUS.DRAFT
    );
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
