import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import PostPanelAssignments from './postPanelAssignments';

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

  test('returns data id from API', async () => {
    mockedAuthClient.post.mockResolvedValue({ data: '' });
    const result = await PostPanelAssignments(mockedAuthClient, 'dummy');
    expect(result).to.deep.equal('');
  });

  test('returns error message on API failure', async () => {
    mockedAuthClient.post.mockRejectedValue(new Error('Network Error'));
    const result = await PostPanelAssignments(mockedAuthClient, 'dummy');
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    mockedAuthClient.post.mockRejectedValue({ unexpected: 'object' });
    const result = await PostPanelAssignments(mockedAuthClient, 'dummy');
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    mockedAuthClient.post.mockResolvedValue(undefined);
    const result = await PostPanelAssignments(mockedAuthClient, 'dummy');
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result null', async () => {
    mockedAuthClient.post.mockResolvedValue(null);
    const result = await PostPanelAssignments(mockedAuthClient, 'dummy');
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
