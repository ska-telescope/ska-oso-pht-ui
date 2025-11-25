import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import Proposal, { ProposalBackend } from '@utils/types/proposal.tsx';
import { PROPOSAL_STATUS } from '@utils/constants.ts';
import * as CONSTANTS from '@utils/constants.ts';
import { mapping } from '../../get/getProposal/getProposal.tsx';
import PostProposal, { mappingPostProposal, mockPostProposal } from './postProposal.tsx';
import { MockProposalFrontend } from './mockProposalFrontend.tsx';
import { MockProposalBackend } from './mockProposalBackend.tsx';

describe('Helper Functions', () => {
  test('mockPostProposal returns mock proposal', () => {
    const result = mockPostProposal();
    expect(result).to.deep.equal(mapping(MockProposalBackend));
  });

  test('mappingPostProposal returns mapped proposal from frontend to backend format', () => {
    const proposalBackEnd: ProposalBackend = mappingPostProposal(
      MockProposalFrontend,
      PROPOSAL_STATUS.DRAFT,
      false
    );
    expect(proposalBackEnd).to.deep.equal(MockProposalBackend);
  });

  test('mappingPostProposal returns mapped proposal and returns empty array of sub-type when not specified', () => {
    const proposal = { ...MockProposalFrontend, proposalSubType: undefined };
    const proposalBackEnd: ProposalBackend = mappingPostProposal(
      proposal,
      PROPOSAL_STATUS.DRAFT,
      false
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

  test('returns mock proposal when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await PostProposal(
      mockedAuthClient,
      MockProposalFrontend,
      PROPOSAL_STATUS.DRAFT
    );
    expect(result).to.deep.equal(mapping(MockProposalBackend));
  });

  test('returns proposal from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockResolvedValue({ data: MockProposalBackend });
    const result = (await PostProposal(
      mockedAuthClient,
      MockProposalFrontend,
      PROPOSAL_STATUS.DRAFT
    )) as Proposal;
    expect(result).to.deep.equal(mapping(MockProposalBackend));
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
