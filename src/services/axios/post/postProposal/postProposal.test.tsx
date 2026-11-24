import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { AxiosError, type AxiosResponse } from 'axios';
import { PROPOSAL_STATUS, TEAM_STATUS_TYPE_OPTIONS } from '@utils/constants.ts';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { mapFormToPdm, mapPdmToForm } from '@/models/proposals/pdmMapper';
import type { ProposalType } from '@/models/proposals/proposal';
import { MockProposalBackend } from '../../get/getProposal/mockProposalBackend.tsx';
import { MockUserFrontendList } from '../../get/getUserByEmail/mockUserFrontend';
import { UNKNOWN_API_ERROR } from '../../apiResult/apiResult.ts';
import PostProposal from './postProposal.tsx';

const { mockCreateProposal } = vi.hoisted(() => ({ mockCreateProposal: vi.fn() }));

vi.mock('@/generated', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/generated')>()),
  PPTAPIProposalPreparationApiFactory: () => ({
    createProposalOsoApiV17PhtPrslsCreatePost: mockCreateProposal
  })
}));

// A proposal with calculated sensitivities on its links, as a clone starts from
const pdm = MockProposalBackend as ProposalBackend;
const values: ProposalType = mapPdmToForm(pdm);

const sentPayload = (): ProposalBackend => mockCreateProposal.mock.calls[0][0];

describe('PostProposal', () => {
  beforeEach(() => {
    mockCreateProposal.mockReset();
  });

  test('creates the proposal from the form values as a draft and returns the created PDM', async () => {
    mockCreateProposal.mockResolvedValue({ data: pdm });

    const result = await PostProposal(values);

    expect(mockCreateProposal).toHaveBeenCalledOnce();
    const payload = sentPayload();
    const mapped = mapFormToPdm(values);
    // The proposal's own ID, minted when it was started or cloned
    expect(payload.prsl_id).toBe(values.prslId);
    expect(payload.cycle).toBe(mapped.cycle);
    expect(payload.proposal_info.title).toBe(mapped.proposal_info.title);
    expect(payload.observation_info.targets).toEqual(mapped.observation_info.targets);
    expect(payload.observation_info.observation_sets).toEqual(
      mapped.observation_info.observation_sets
    );
    expect(payload).toMatchObject({
      status: PROPOSAL_STATUS.DRAFT,
      submitted_on: null,
      submitted_by: ''
    });
    expect(result).toEqual({ data: pdm });
  });

  test('keeps the links but not their stale sensitivity results', async () => {
    expect(values.targetObservation.length).toBeGreaterThan(0);
    expect(pdm.observation_info.result_details?.some((link) => link.result)).toBe(true);
    mockCreateProposal.mockResolvedValue({ data: pdm });

    await PostProposal(values);

    const links = sentPayload().observation_info.result_details ?? [];
    expect(
      links.map(({ target_ref, observation_set_ref, data_product_ref }) => [
        target_ref,
        observation_set_ref,
        data_product_ref
      ])
    ).toEqual(
      values.targetObservation.map((link) => [
        link.targetId,
        link.observationId,
        link.dataProductsSDPId
      ])
    );
    expect(links.every((link) => link.result === null)).toBe(true);
  });

  test('sends every investigator as pending, as invitations to the new proposal start afresh', async () => {
    const investigator = { ...MockUserFrontendList[0], status: TEAM_STATUS_TYPE_OPTIONS.accepted };
    mockCreateProposal.mockResolvedValue({ data: pdm });

    await PostProposal({ ...values, investigators: [investigator] });

    expect(sentPayload().proposal_info.investigators).toEqual([
      expect.objectContaining({
        user_id: investigator.id,
        status: TEAM_STATUS_TYPE_OPTIONS.pending
      })
    ]);
  });

  test('returns the standard error when the API returns no data', async () => {
    mockCreateProposal.mockResolvedValue(undefined);
    await expect(PostProposal(values)).resolves.toEqual({ error: UNKNOWN_API_ERROR });
  });

  test('returns the error message when the request fails', async () => {
    mockCreateProposal.mockRejectedValue(new Error('Network Error'));
    await expect(PostProposal(values)).resolves.toEqual({ error: 'Network Error' });
  });

  test('returns the standard error when something other than an Error is thrown', async () => {
    mockCreateProposal.mockRejectedValue({ unexpected: 'object' });
    await expect(PostProposal(values)).resolves.toEqual({ error: UNKNOWN_API_ERROR });
  });

  test('returns the server error from a failed request', async () => {
    mockCreateProposal.mockRejectedValue(
      new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 400,
        data: { title: 'Bad Request', detail: 'Proposal already exists' }
      } as AxiosResponse)
    );
    await expect(PostProposal(values)).resolves.toEqual({
      error: 'Bad Request: Proposal already exists'
    });
  });
});
