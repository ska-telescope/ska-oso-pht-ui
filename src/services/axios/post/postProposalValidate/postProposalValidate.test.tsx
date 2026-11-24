import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { AxiosError, type AxiosResponse } from 'axios';
import { PROPOSAL_STATUS } from '@utils/constants.ts';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { MockProposalBackend } from '@services/axios/get/getProposal/mockProposalBackend.tsx';
import { mapFormToPdm, mapPdmToForm } from '@/models/proposals/pdmMapper';
import { UNKNOWN_API_ERROR } from '../../apiResult/apiResult.ts';
import PostProposalValidate from './postProposalValidate.tsx';

const { mockValidate } = vi.hoisted(() => ({ mockValidate: vi.fn() }));

vi.mock('@/generated', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/generated')>()),
  PPTAPIProposalPreparationApiFactory: () => ({
    validateProposalOsoApiV17PhtPrslsValidatePost: mockValidate
  })
}));

const values = mapPdmToForm(MockProposalBackend as ProposalBackend);

describe('PostProposalValidate', () => {
  beforeEach(() => {
    mockValidate.mockReset();
  });

  test('sends the proposal mapped from the form as a draft', async () => {
    mockValidate.mockResolvedValue({ data: { result: true, validation_errors: [] } });

    await PostProposalValidate(values);

    expect(mockValidate).toHaveBeenCalledExactlyOnceWith({
      ...mapFormToPdm(values),
      status: PROPOSAL_STATUS.DRAFT,
      submitted_on: null,
      submitted_by: ''
    });
  });

  test('returns confirmation when the proposal is valid', async () => {
    mockValidate.mockResolvedValue({ data: { result: true, validation_errors: [] } });
    await expect(PostProposalValidate(values)).resolves.toStrictEqual({ valid: 'success' });
  });

  test('returns the validation errors when the proposal is invalid', async () => {
    const errorList = ['This proposal has no observation sets'];
    mockValidate.mockResolvedValue({ data: { result: false, validation_errors: errorList } });
    await expect(PostProposalValidate(values)).resolves.toStrictEqual({ error: errorList });
  });

  test('returns the standard error when the API returns no data', async () => {
    mockValidate.mockResolvedValue(undefined);
    await expect(PostProposalValidate(values)).resolves.toStrictEqual({
      error: [UNKNOWN_API_ERROR]
    });
  });

  test('returns the standard error when the response is in an unexpected format', async () => {
    mockValidate.mockResolvedValue({ data: { result: 'some unexpected format' } });
    await expect(PostProposalValidate(values)).resolves.toStrictEqual({
      error: [UNKNOWN_API_ERROR]
    });
  });

  test('returns the error message when the request fails', async () => {
    mockValidate.mockRejectedValue(new Error('Network Error'));
    await expect(PostProposalValidate(values)).resolves.toStrictEqual({
      error: ['Network Error']
    });
  });

  test('returns the server error from a failed request', async () => {
    mockValidate.mockRejectedValue(
      new AxiosError('Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, {
        status: 500,
        data: { title: 'Internal Server Error', detail: 'Validation unavailable' }
      } as AxiosResponse)
    );
    await expect(PostProposalValidate(values)).resolves.toStrictEqual({
      error: ['Internal Server Error: Validation unavailable']
    });
  });

  test('returns the standard error when something other than an Error is thrown', async () => {
    mockValidate.mockRejectedValue({ unexpected: 'object' });
    await expect(PostProposalValidate(values)).resolves.toStrictEqual({
      error: [UNKNOWN_API_ERROR]
    });
  });
});
