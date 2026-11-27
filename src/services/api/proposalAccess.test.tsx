import { beforeEach, describe, expect, test, vi } from 'vitest';
import MockProposalAccessBackend from '@/models/proposalAccess/mockProposalAccessBackend';
import MockProposalAccessFrontend from '@/models/proposalAccess/mockProposalAccessFrontend';
import { UNKNOWN_API_ERROR } from './apiResult';
import {
  createAccess,
  listAccessForProposal,
  listAccessForUser,
  updateAccess
} from './proposalAccess';

// The error handling common to every call is tested with callApi (apiResult.test.tsx)

const { mockForUser, mockForProposal, mockCreate, mockUpdate } = vi.hoisted(() => ({
  mockForUser: vi.fn(),
  mockForProposal: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdate: vi.fn()
}));

vi.mock('./client', () => ({
  osoApiBasePath: '',
  api: {
    access: {
      getAccessForUserOsoApiV17PhtProposalAccessUserGet: mockForUser,
      getAccessByPrslIdOsoApiV17PhtProposalAccessPrslIdGet: mockForProposal,
      postCreateAccessOsoApiV17PhtProposalAccessCreatePost: mockCreate,
      updateAccessOsoApiV17PhtProposalAccessUserAccessIdPut: mockUpdate
    }
  }
}));

const [access] = MockProposalAccessFrontend;
const [accessPdm] = MockProposalAccessBackend;

beforeEach(() => {
  vi.resetAllMocks();
});

describe('listAccessForUser', () => {
  test("returns the user's access, mapped", async () => {
    mockForUser.mockResolvedValue({ data: MockProposalAccessBackend });
    await expect(listAccessForUser()).resolves.toEqual({ data: MockProposalAccessFrontend });
  });

  test('returns the standard error when the response is not a list', async () => {
    mockForUser.mockResolvedValue({ data: { not: 'a list' } });
    await expect(listAccessForUser()).resolves.toEqual({ error: UNKNOWN_API_ERROR });
  });
});

describe('listAccessForProposal', () => {
  test("fetches the proposal's access by its ID, mapped", async () => {
    mockForProposal.mockResolvedValue({ data: MockProposalAccessBackend });

    await expect(listAccessForProposal(access.prslId)).resolves.toEqual({
      data: MockProposalAccessFrontend
    });
    expect(mockForProposal).toHaveBeenCalledExactlyOnceWith(access.prslId);
  });
});

describe('createAccess', () => {
  test("sends the access in the ODA's shape and returns the new access's ID", async () => {
    mockCreate.mockResolvedValue({ data: access.id });

    await expect(createAccess(access)).resolves.toEqual({ data: access.id });
    expect(mockCreate).toHaveBeenCalledExactlyOnceWith(accessPdm);
  });
});

describe('updateAccess', () => {
  test('sends the access by its ID and returns it as stored, mapped', async () => {
    mockUpdate.mockResolvedValue({ data: accessPdm });

    await expect(updateAccess(access)).resolves.toEqual({ data: access });
    expect(mockUpdate).toHaveBeenCalledExactlyOnceWith(access.id, accessPdm);
  });

  test('returns the error from a failed update', async () => {
    mockUpdate.mockRejectedValue(new Error('Network Error'));
    await expect(updateAccess(access)).resolves.toEqual({ error: 'Network Error' });
  });
});
