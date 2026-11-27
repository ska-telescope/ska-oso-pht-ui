import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MockUserFrontendList } from '@services/axios/get/getUserByEmail/mockUserFrontend';
import { MockUserMSGraphList } from '@services/axios/get/getUserByEmail/mockUserMSGraph';
import { UNKNOWN_API_ERROR } from './apiResult';
import { findUserByEmail, sendInvite } from './users';

// The error handling common to every call is tested with callApi (apiResult.test.tsx)

const { mockFind, mockSend } = vi.hoisted(() => ({ mockFind: vi.fn(), mockSend: vi.fn() }));

vi.mock('./client', () => ({
  osoApiBasePath: '',
  api: {
    proposals: {
      getUserByEmailOsoApiV17PhtPrslsMemberEmailGet: mockFind,
      sendEmailOsoApiV17PhtPrslsSendEmailPost: mockSend
    }
  }
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('findUserByEmail', () => {
  test('finds the user by email and returns them as a pending investigator', async () => {
    const [user] = MockUserMSGraphList;
    mockFind.mockResolvedValue({ data: user });

    await expect(findUserByEmail(user.email)).resolves.toEqual({ data: MockUserFrontendList[0] });
    expect(mockFind).toHaveBeenCalledExactlyOnceWith(user.email);
  });

  test('returns the standard error when the response is not a user', async () => {
    mockFind.mockResolvedValue({ data: 'not a user' });
    await expect(findUserByEmail('someone@example.com')).resolves.toEqual({
      error: UNKNOWN_API_ERROR
    });
  });

  test('returns the error when the user is not found', async () => {
    mockFind.mockRejectedValue(new Error('Not found'));
    await expect(findUserByEmail('someone@example.com')).resolves.toEqual({ error: 'Not found' });
  });
});

describe('sendInvite', () => {
  test('emails the invitation to the given proposal', async () => {
    mockSend.mockResolvedValue({ data: { message: 'sent' } });

    await expect(sendInvite('someone@example.com', 'prsl-1')).resolves.toEqual({
      data: { message: 'sent' }
    });
    expect(mockSend).toHaveBeenCalledExactlyOnceWith({
      email: 'someone@example.com',
      prsl_id: 'prsl-1'
    });
  });

  test('returns the error from a failed send', async () => {
    mockSend.mockRejectedValue(new Error('Network Error'));
    await expect(sendInvite('someone@example.com', 'prsl-1')).resolves.toEqual({
      error: 'Network Error'
    });
  });
});
