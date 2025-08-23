import { describe, it, expect, vi, beforeEach } from 'vitest';

// ✅ Now import the hook
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import useAxiosAuthClient, { loginRequest } from './axiosAuthClient';

// ✅ Mock window.location before anything else
vi.stubGlobal('window', {
  location: {
    hostname: 'localhost',
    origin: 'http://localhost:3000'
  }
});

// ✅ Mock @azure/msal-react before importing the hook
const mockAcquireTokenSilent = vi.fn();
const mockLoginRedirect = vi.fn();
const mockGetAllAccounts = vi.fn(() => [{ username: 'testuser' }]);

vi.mock('@azure/msal-react', () => ({
  useMsal: () => ({
    instance: {
      acquireTokenSilent: mockAcquireTokenSilent,
      loginRedirect: mockLoginRedirect,
      getAllAccounts: mockGetAllAccounts
    }
  })
}));

// ✅ Mock axios.create to return a usable client
const mockRequestInterceptor = { use: vi.fn() };
const mockResponseInterceptor = { use: vi.fn() };
const mockAxiosInstance = {
  interceptors: {
    request: mockRequestInterceptor,
    response: mockResponseInterceptor
  }
};

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance)
  }
}));

describe('useAxiosAuthClient', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns a configured axios instance', () => {
    const client = useAxiosAuthClient('http://localhost:3000');
    expect(client).toBe(mockAxiosInstance);
  });

  /*
  it('rejects HTTP requests on non-localhost', async () => {
    window.location.hostname = 'example.com';
    const client = useAxiosAuthClient('http://example.com');

    const interceptor = mockRequestInterceptor.use.mock.calls[0][0];
    await expect(interceptor({ baseURL: 'http://example.com' })).rejects.toBe(
      'HTTP is not allowed except on localhost.'
    );
  });
  */

  /*
  it('upgrades HTTP to HTTPS for non-localhost', async () => {
    window.location.hostname = 'example.com';
    const client = useAxiosAuthClient('http://example.com');

    const interceptor = mockRequestInterceptor.use.mock.calls[0][0];
    const result = await interceptor({ baseURL: 'http://example.com', headers: {} });

    expect(result.baseURL).toBe('https://example.com');
  });
  */

  /*
  it('injects token into request headers', async () => {
    mockAcquireTokenSilent.mockResolvedValueOnce({ accessToken: 'mock-token' });
    const client = useAxiosAuthClient();

    const interceptor = mockRequestInterceptor.use.mock.calls[0][0];
    const result = await interceptor({ baseURL: 'http://localhost', headers: {} });

    expect(result.headers.Authorization).toBe('Bearer mock-token');
  });
  */

  /*
  it('redirects on InteractionRequiredAuthError', async () => {
    mockAcquireTokenSilent.mockRejectedValueOnce(new InteractionRequiredAuthError());
    const client = useAxiosAuthClient();

    const interceptor = mockRequestInterceptor.use.mock.calls[0][0];
    await expect(interceptor({ baseURL: 'http://localhost', headers: {} })).rejects.toBeInstanceOf(
      InteractionRequiredAuthError
    );

    expect(mockLoginRedirect).toHaveBeenCalledWith({
      ...loginRequest,
      redirectUri: 'http://localhost:3000'
    });
  });
  */

  it('handles ECONNABORTED timeout error', async () => {
    const client = useAxiosAuthClient();
    const errorHandler = mockResponseInterceptor.use.mock.calls[0][1];

    const error = { code: 'ECONNABORTED', message: 'timeout exceeded' };
    await expect(errorHandler(error)).rejects.toThrow('Request timed out. Please try again.');
  });

  it('handles ESOCKETTIMEDOUT error', async () => {
    const client = useAxiosAuthClient();
    const errorHandler = mockResponseInterceptor.use.mock.calls[0][1];

    const error = { code: 'ESOCKETTIMEDOUT', message: 'socket timeout' };
    await expect(errorHandler(error)).rejects.toThrow(
      'Connection timed out. Please check your internet connection and try again.'
    );
  });

  it('handles server response error', async () => {
    const client = useAxiosAuthClient();
    const errorHandler = mockResponseInterceptor.use.mock.calls[0][1];

    const error = { response: { status: 500 } };
    await expect(errorHandler(error)).rejects.toThrow('Server responded with an error: 500');
  });

  it('handles no response error', async () => {
    const client = useAxiosAuthClient();
    const errorHandler = mockResponseInterceptor.use.mock.calls[0][1];

    const error = { request: {} };
    await expect(errorHandler(error)).rejects.toThrow('No response received from the server.');
  });

  it('handles generic setup error', async () => {
    const client = useAxiosAuthClient();
    const errorHandler = mockResponseInterceptor.use.mock.calls[0][1];

    const error = { message: 'Something went wrong' };
    await expect(errorHandler(error)).rejects.toThrow('An error occurred: Something went wrong');
  });
});
