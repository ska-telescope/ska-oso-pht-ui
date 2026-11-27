import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PROPOSAL_STATUS } from '@utils/constants.ts';
import { getUserId } from '@utils/aaa/aaaUtils.tsx';
import { MockProposalBackend } from '@services/axios/get/getProposal/mockProposalBackend.tsx';
import type { Proposal as ProposalPDM } from '@/generated/models/proposal';
import { UNKNOWN_API_ERROR } from './apiResult';
import { createProposal, getProposal, updateProposal, validateProposal } from './proposals';

// The error handling common to every call is tested with callApi (apiResult.test.tsx). These
// tests cover what each call sends and how it reads the response. The form mapping, and the rules
// for a new proposal, are tested with useProposalOda.

const { mockGet, mockUpdate, mockCreate, mockValidate } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockUpdate: vi.fn(),
  mockCreate: vi.fn(),
  mockValidate: vi.fn()
}));

vi.mock('./client', () => ({
  osoApiBasePath: '',
  api: {
    proposals: {
      getProposalOsoApiV17PhtPrslsPrslIdGet: mockGet,
      updateProposalOsoApiV17PhtPrslsPrslIdPut: mockUpdate,
      createProposalOsoApiV17PhtPrslsCreatePost: mockCreate,
      validateProposalOsoApiV17PhtPrslsValidatePost: mockValidate
    }
  }
}));

const pdm = MockProposalBackend as ProposalPDM;
const draftMetadata = { status: PROPOSAL_STATUS.DRAFT, submitted_on: null, submitted_by: '' };

beforeEach(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
});

describe('getProposal', () => {
  test('fetches the proposal by ID and returns the PDM', async () => {
    mockGet.mockResolvedValue({ data: pdm });

    await expect(getProposal('prp-1')).resolves.toEqual({ data: pdm });
    expect(mockGet).toHaveBeenCalledExactlyOnceWith('prp-1');
  });
});

describe('updateProposal', () => {
  test('saves a draft by default', async () => {
    mockUpdate.mockResolvedValue({ data: pdm });

    await expect(updateProposal(pdm)).resolves.toEqual({ data: pdm });
    expect(mockUpdate).toHaveBeenCalledWith(
      pdm.prsl_id,
      expect.objectContaining({ status: PROPOSAL_STATUS.DRAFT })
    );
  });

  test.each([PROPOSAL_STATUS.DRAFT, PROPOSAL_STATUS.SUBMITTED])(
    'sends the PDM with the save metadata for %s',
    async (status) => {
      vi.useFakeTimers({ toFake: ['Date'] });
      mockUpdate.mockResolvedValue({ data: pdm });
      const submitted = status === PROPOSAL_STATUS.SUBMITTED;

      await updateProposal(pdm, status);

      expect(mockUpdate).toHaveBeenCalledExactlyOnceWith(pdm.prsl_id, {
        ...pdm,
        status,
        submitted_on: submitted ? new Date().toISOString() : null,
        submitted_by: submitted ? getUserId() : ''
      });
    }
  );

  test('returns the error from a failed save', async () => {
    mockUpdate.mockRejectedValue(new Error('Network Error'));
    await expect(updateProposal(pdm)).resolves.toEqual({ error: 'Network Error' });
  });
});

describe('createProposal', () => {
  test('creates the proposal from the PDM as a draft and returns the created PDM', async () => {
    mockCreate.mockResolvedValue({ data: pdm });

    await expect(createProposal(pdm)).resolves.toEqual({ data: pdm });
    expect(mockCreate).toHaveBeenCalledExactlyOnceWith({ ...pdm, ...draftMetadata });
  });
});

describe('validateProposal', () => {
  test('sends the PDM as a draft', async () => {
    mockValidate.mockResolvedValue({ data: { result: true, validation_errors: [] } });

    await validateProposal(pdm);

    expect(mockValidate).toHaveBeenCalledExactlyOnceWith({ ...pdm, ...draftMetadata });
  });

  test('returns a valid result', async () => {
    mockValidate.mockResolvedValue({ data: { result: true, validation_errors: [] } });
    await expect(validateProposal(pdm)).resolves.toStrictEqual({
      data: { valid: true, errors: [] }
    });
  });

  test('returns the reasons when the proposal is invalid', async () => {
    const errors = ['This proposal has no observation sets'];
    mockValidate.mockResolvedValue({ data: { result: false, validation_errors: errors } });
    await expect(validateProposal(pdm)).resolves.toStrictEqual({
      data: { valid: false, errors }
    });
  });

  test('returns the standard error when the response is in an unexpected format', async () => {
    mockValidate.mockResolvedValue({ data: { result: 'some unexpected format' } });
    await expect(validateProposal(pdm)).resolves.toStrictEqual({ error: UNKNOWN_API_ERROR });
  });
});
