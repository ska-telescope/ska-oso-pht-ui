import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { AxiosError, type AxiosResponse } from 'axios';
import { PROPOSAL_STATUS } from '@utils/constants.ts';
import type { Proposal as ProposalPDM } from '@/generated/models/proposal';
import { MockProposalBackend } from '../../get/getProposal/mockProposalBackend.tsx';
import { UNKNOWN_API_ERROR } from '../../apiResult/apiResult.ts';
import PostProposal from './postProposal.tsx';

const { mockCreateProposal } = vi.hoisted(() => ({ mockCreateProposal: vi.fn() }));

vi.mock('@/generated', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/generated')>()),
  PPTAPIProposalPreparationApiFactory: () => ({
    createProposalOsoApiV17PhtPrslsCreatePost: mockCreateProposal
  })
}));

const pdm = MockProposalBackend as ProposalPDM;

describe('PostProposal', () => {
  beforeEach(() => {
    mockCreateProposal.mockReset();
  });

  test('creates the proposal from the PDM as a draft and returns the created PDM', async () => {
    mockCreateProposal.mockResolvedValue({ data: pdm });

    const result = await PostProposal(pdm);

    expect(mockCreateProposal).toHaveBeenCalledExactlyOnceWith({
      ...pdm,
      status: PROPOSAL_STATUS.DRAFT
    });
    expect(result).toEqual({ data: pdm });
  });

  test('returns the standard error when the API returns no data', async () => {
    mockCreateProposal.mockResolvedValue(undefined);
    await expect(PostProposal(pdm)).resolves.toEqual({ error: UNKNOWN_API_ERROR });
  });

  test('returns the error message when the request fails', async () => {
    mockCreateProposal.mockRejectedValue(new Error('Network Error'));
    await expect(PostProposal(pdm)).resolves.toEqual({ error: 'Network Error' });
  });

  test('returns the standard error when something other than an Error is thrown', async () => {
    mockCreateProposal.mockRejectedValue({ unexpected: 'object' });
    await expect(PostProposal(pdm)).resolves.toEqual({ error: UNKNOWN_API_ERROR });
  });

  test('returns the server error from a failed request', async () => {
    mockCreateProposal.mockRejectedValue(
      new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 400,
        data: { title: 'Bad Request', detail: 'Proposal already exists' }
      } as AxiosResponse)
    );
    await expect(PostProposal(pdm)).resolves.toEqual({
      error: 'Bad Request: Proposal already exists'
    });
  });
});
