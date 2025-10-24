import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import PostPanelAssignments from './postPanelAssignments';
import * as CONSTANTS from '@/utils/constants';

describe('PostPanelAssignments Service', () => {
  let mockedAuthClient: any;
  beforeEach(() => {
    vi.resetAllMocks();
    mockedAuthClient = {
      put: vi.fn(),
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { clear: vi.fn, eject: vi.fn(), use: vi.fn() },
        response: { clear: vi.fn, eject: vi.fn(), use: vi.fn() }
      }
    };
  });

  test('returns empty string when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await PostPanelAssignments(mockedAuthClient, 'dummy');
    expect(result).toEqual('');
  });

  test('returns data id from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockResolvedValue({ data: '' });
    const result = await PostPanelAssignments(mockedAuthClient, 'dummy');
    expect(result).to.deep.equal('');
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockRejectedValue(new Error('Network Error'));
    const result = await PostPanelAssignments(mockedAuthClient, 'dummy');
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockRejectedValue({ unexpected: 'object' });
    const result = await PostPanelAssignments(mockedAuthClient, 'dummy');
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockResolvedValue(undefined);
    const result = await PostPanelAssignments(mockedAuthClient, 'dummy');
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result null', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockResolvedValue(null);
    const result = await PostPanelAssignments(mockedAuthClient, 'dummy');
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
