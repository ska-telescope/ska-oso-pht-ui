import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import PutProposalAccess from '@services/axios/put/putProposalAccess/putProposalAccess.tsx';

describe('PutProposalAccess Service', () => {
  let mockedAuthClient: any;
  beforeEach(() => {
    vi.resetAllMocks();
    mockedAuthClient = {
      put: vi.fn()
    };
  });

  test('returns data from API', async () => {
    //TODO
  });

  test('returns error message on API failure', async () => {
    mockedAuthClient.put.mockRejectedValue(new Error('Network Error'));
    const result = await PutProposalAccess(mockedAuthClient, 'dummy');
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    mockedAuthClient.put.mockRejectedValue({ unexpected: 'object' });
    const result = await PutProposalAccess(mockedAuthClient, 'dummy');
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    mockedAuthClient.put.mockResolvedValue(undefined);
    const result = await PutProposalAccess(mockedAuthClient, 'dummy');
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result null', async () => {
    mockedAuthClient.put.mockResolvedValue(null);
    const result = await PutProposalAccess(mockedAuthClient, 'dummy');
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
