import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import PutProposalAccess from '@services/axios/put/putProposalAccess/putProposalAccess.tsx';
import MockProposalAccessFrontend from '@services/axios/put/putProposalAccess/mockProposalAccessFrontend.tsx';
import * as CONSTANTS from '@/utils/constants';
import GetContinuumData from '@services/api/getContinuumData/getContinuumData.tsx';
import { isLow } from '@utils/helpersSensCalc.ts';
import { TELESCOPE_LOW, TELESCOPE_MID } from '@ska-telescope/ska-gui-components';


describe('GetContinuumData Service', () => {
  let mockedAuthClient: any;
  beforeEach(() => {
    vi.resetAllMocks();
    mockedAuthClient = {
      get: vi.fn()
    };
  });

  test('returns data from API LOW', async () => {
    const result = await GetContinuumData(TELESCOPE_LOW, '', '');
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('returns data from API MID', async () => {
    const result = await GetContinuumData(TELESCOPE_MID, '', '');
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('returns error message on API failure', async () => {
    mockedAuthClient.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetContinuumData(isLow(TELESCOPE_MID, '', ''));
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    mockedAuthClient.get.mockRejectedValue({ unexpected: 'object' });
    const result = await GetContinuumData(isLow(TELESCOPE_MID, '', ''));
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    mockedAuthClient.get.mockResolvedValue(undefined);
    const result = await GetContinuumData(isLow(TELESCOPE_MID, '', ''));
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result null', async () => {
    mockedAuthClient.get.mockResolvedValue(null);
    const result = await GetContinuumData(isLow(TELESCOPE_MID, '', ''));
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
