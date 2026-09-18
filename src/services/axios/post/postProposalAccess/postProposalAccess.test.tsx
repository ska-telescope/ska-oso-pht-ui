import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import PostProposalAccess from '@services/axios/post/postProposalAccess/postProposalAccess.tsx';

describe('PostProposalAccess Service', () => {
  let mockedAuthClient: any;
  beforeEach(() => {
    vi.resetAllMocks();
    mockedAuthClient = {
      post: vi.fn()
    };
  });

  test('returns error message on API failure', async () => {
    mockedAuthClient.post.mockRejectedValue(new Error('Network Error'));
    const result = await PostProposalAccess(mockedAuthClient, 'dummy');
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    mockedAuthClient.post.mockRejectedValue({ unexpected: 'object' });
    const result = await PostProposalAccess(mockedAuthClient, 'dummy');
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    mockedAuthClient.post.mockResolvedValue(undefined);
    const result = await PostProposalAccess(mockedAuthClient, 'dummy');
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result null', async () => {
    mockedAuthClient.post.mockResolvedValue(null);
    const result = await PostProposalAccess(mockedAuthClient, 'dummy');
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
