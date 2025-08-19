import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import PutProposalAccess from '@services/axios/put/putProposalAccess/putProposalAccess.tsx';
import MockProposalAccessFrontend from '@services/axios/put/putProposalAccess/mockProposalAccessFrontend.tsx';
import MockProposalAccessBackend from '@services/axios/put/putProposalAccess/mockProposalAccessBackend.tsx';
import * as CONSTANTS from '@/utils/constants';

describe('PutProposalAccess Service', () => {
  let mockedAuthClient: any;
  beforeEach(() => {
    vi.resetAllMocks();
    mockedAuthClient = {
      put: vi.fn()
    };
  });

  test('returns mocked data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await PutProposalAccess(mockedAuthClient, 'dummy');
    expect(result).toEqual(MockProposalAccessFrontend);
  });

  test('returns data from API when USE_LOCAL_DATA is false', async () => {
    //TODO
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockRejectedValue(new Error('Network Error'));
    const result = await PutProposalAccess(mockedAuthClient, 'dummy');
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockRejectedValue({ unexpected: 'object' });
    const result = await PutProposalAccess(mockedAuthClient, 'dummy');
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockResolvedValue(undefined);
    const result = await PutProposalAccess(mockedAuthClient, 'dummy');
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result null', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockResolvedValue(null);
    const result = await PutProposalAccess(mockedAuthClient, 'dummy');
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
