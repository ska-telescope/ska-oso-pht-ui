import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import Proposal from '@utils/types/proposal.tsx';
import { PROPOSAL_STATUS } from '@utils/constants.ts';
import { mapping } from '../../get/getProposal/getProposal.tsx';
import PostProposal, { mockPostProposal } from './postProposal.tsx';
import { MockProposalFrontend } from './mockProposalFrontend.tsx';
import { MockProposalBackend } from './mockProposalBackend.tsx';

describe('Helper Functions', () => {
  test('mockPostProposal returns mock proposal', () => {
    const result = mockPostProposal();
    expect(result).to.deep.equal(mapping(MockProposalBackend));
  });
});

describe('PostProposal Service', () => {
  let mockedAuthClient: any;
  let mockRefreshAuthToken: any;
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
    mockRefreshAuthToken = vi.fn().mockResolvedValue(undefined);
  });

  test('returns proposal from API', async () => {
    mockedAuthClient.post.mockResolvedValue({ data: MockProposalBackend });
    const result = (await PostProposal(
      mockedAuthClient,
      mockRefreshAuthToken,
      MockProposalFrontend,
      PROPOSAL_STATUS.DRAFT
    )) as Proposal;
    expect(result).to.deep.equal(mapping(MockProposalBackend));
  });

  test('calls refreshAuthToken after a successful create', async () => {
    mockedAuthClient.post.mockResolvedValue({ data: MockProposalBackend });

    await PostProposal(
      mockedAuthClient,
      mockRefreshAuthToken,
      MockProposalFrontend,
      PROPOSAL_STATUS.DRAFT
    );

    expect(mockRefreshAuthToken).toHaveBeenCalledTimes(1);
  });

  test('returns error message on API failure', async () => {
    mockedAuthClient.post.mockRejectedValue(new Error('Network Error'));
    const result = await PostProposal(
      mockedAuthClient,
      mockRefreshAuthToken,
      MockProposalFrontend,
      PROPOSAL_STATUS.DRAFT
    );
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    mockedAuthClient.post.mockRejectedValue({ unexpected: 'object' });
    const result = await PostProposal(
      mockedAuthClient,
      mockRefreshAuthToken,
      MockProposalFrontend,
      PROPOSAL_STATUS.DRAFT
    );
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    mockedAuthClient.post.mockResolvedValue(undefined);
    const result = await PostProposal(
      mockedAuthClient,
      mockRefreshAuthToken,
      MockProposalFrontend,
      PROPOSAL_STATUS.DRAFT
    );
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('sends payload with a freshly minted prsl_id, without investigator_refs, or stale result_details', async () => {
    mockedAuthClient.post.mockResolvedValue({ data: MockProposalBackend });

    await PostProposal(
      mockedAuthClient,
      mockRefreshAuthToken,
      MockProposalFrontend,
      PROPOSAL_STATUS.DRAFT
    );

    const [, sentBody] = mockedAuthClient.post.mock.calls[0];
    // The client mints its own SKUID rather than relying on the backend to generate one - see
    // postProposal.tsx for why this is safe (ska-db-oda only mints its own as a fallback).
    expect(sentBody.prsl_id).toMatch(/^prp-[0-9a-z]+$/);
    expect(sentBody.prsl_id).not.toEqual(MockProposalFrontend.id);
    expect(sentBody).not.toHaveProperty('investigator_refs');
    expect(sentBody.observation_info.result_details).toEqual([]);
  });

  test('returns error.API_UNKNOWN_ERROR when result null', async () => {
    mockedAuthClient.post.mockResolvedValue(null);
    const result = await PostProposal(
      mockedAuthClient,
      mockRefreshAuthToken,
      MockProposalFrontend,
      PROPOSAL_STATUS.DRAFT
    );
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
