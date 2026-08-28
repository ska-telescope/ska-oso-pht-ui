import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import useAxiosAuthClient, { mapAxiosError } from './axiosAuthClient';

vi.stubGlobal('window', {
  location: { hostname: 'localhost', origin: 'http://localhost:3000' },
  // createRequestInterceptor's tests re-import axiosAuthClient.ts fresh via vi.resetModules() (to
  // reset its module-level loginRedirectTriggered flag between tests), which re-runs
  // constants.ts's top-level window.localStorage.getItem calls - so this stub needs a
  // localStorage, unlike when the module was only ever evaluated once.
  localStorage: { getItem: () => null }
});

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

const mockRequestUse = vi.fn();
const mockResponseUse = vi.fn();
const mockAxiosInstance = {
  interceptors: {
    request: { use: mockRequestUse },
    response: { use: mockResponseUse }
  }
};

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return {
    ...actual,
    default: { create: vi.fn(() => mockAxiosInstance) }
  };
});

const asAxiosError = (partial: Partial<AxiosError>) => partial as AxiosError;
const asRequestConfig = (partial: Partial<InternalAxiosRequestConfig>) =>
  partial as InternalAxiosRequestConfig;

describe('mapAxiosError', () => {
  it('maps a timeout (ECONNABORTED) error', () => {
    const error = asAxiosError({ code: 'ECONNABORTED', message: 'timeout exceeded' });
    expect(mapAxiosError(error).message).toBe('Request timed out. Please try again.');
  });

  it('maps a socket timeout (ESOCKETTIMEDOUT) error', () => {
    const error = asAxiosError({ code: 'ESOCKETTIMEDOUT' });
    expect(mapAxiosError(error).message).toBe(
      'Connection timed out. Please check your internet connection and try again.'
    );
  });

  it('maps a server error response', () => {
    const error = asAxiosError({ response: { status: 500 } } as Partial<AxiosError>);
    expect(mapAxiosError(error).message).toBe('Server responded with an error: 500');
  });

  it('maps a request that received no response', () => {
    const error = asAxiosError({ request: {} });
    expect(mapAxiosError(error).message).toBe('No response received from the server.');
  });

  it('maps any other setup error', () => {
    const error = asAxiosError({ message: 'Something went wrong' });
    expect(mapAxiosError(error).message).toBe('An error occurred: Something went wrong');
  });
});

describe('createRequestInterceptor', () => {
  const mockInstance = {
    acquireTokenSilent: mockAcquireTokenSilent,
    loginRedirect: mockLoginRedirect,
    getAllAccounts: mockGetAllAccounts
  } as any;

  // loginRedirectTriggered is module-level state (shared across every request, deliberately, so
  // concurrent requests only redirect once - see its own comment in axiosAuthClient.ts). Each of
  // these tests needs it to start false, so re-import the module fresh rather than let one test's
  // redirect leave it set for the next.
  let createRequestInterceptor: typeof import('./axiosAuthClient').createRequestInterceptor;
  let loginRequest: typeof import('./axiosAuthClient').loginRequest;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockGetAllAccounts.mockReturnValue([{ username: 'testuser' }]);
    (window as any).location.hostname = 'localhost';
    vi.resetModules();
    ({ createRequestInterceptor, loginRequest } = await import('./axiosAuthClient'));
  });

  it('rejects HTTP requests on non-localhost', async () => {
    (window as any).location.hostname = 'example.com';
    const interceptor = createRequestInterceptor(mockInstance);

    await expect(interceptor(asRequestConfig({ baseURL: 'http://example.com' }))).rejects.toBe(
      'HTTP is not allowed except on localhost.'
    );
  });

  it('allows HTTP requests on localhost', async () => {
    mockAcquireTokenSilent.mockResolvedValue({ accessToken: 'mock-token' });
    const interceptor = createRequestInterceptor(mockInstance);

    const result = await interceptor(
      asRequestConfig({ baseURL: 'http://localhost:3000', headers: {} as any })
    );

    expect(result.baseURL).toBe('http://localhost:3000');
  });

  it('injects a bearer token when an account is signed in', async () => {
    mockAcquireTokenSilent.mockResolvedValue({ accessToken: 'mock-token' });
    const interceptor = createRequestInterceptor(mockInstance);

    const result = await interceptor(
      asRequestConfig({ baseURL: 'http://localhost:3000', headers: {} as any })
    );

    expect(result.headers.Authorization).toBe('Bearer mock-token');
  });

  it('retries then redirects to login when no account is signed in', async () => {
    vi.useFakeTimers();
    try {
      mockGetAllAccounts.mockReturnValue([]);
      const interceptor = createRequestInterceptor(mockInstance);
      const request = asRequestConfig({ baseURL: 'http://localhost:3000', headers: {} as any });

      const resultPromise = interceptor(request);

      // Assert on the rejection in the same microtask turn as advancing the timers, rather than
      // awaiting the timers first - otherwise the promise rejects while nothing is attached to it
      // yet, which vitest reports as an unhandled rejection even though it's handled a line later.
      await Promise.all([
        vi.runAllTimersAsync(),
        expect(resultPromise).rejects.toThrow('No MSAL session found - redirecting to login.')
      ]);
      expect(mockAcquireTokenSilent).not.toHaveBeenCalled();
      expect(mockLoginRedirect).toHaveBeenCalledWith(loginRequest);
    } finally {
      vi.useRealTimers();
    }
  });

  it('redirects to login on InteractionRequiredAuthError', async () => {
    const authError = new InteractionRequiredAuthError('interaction_required', 'test');
    mockAcquireTokenSilent.mockRejectedValue(authError);
    const interceptor = createRequestInterceptor(mockInstance);

    await expect(
      interceptor(asRequestConfig({ baseURL: 'http://localhost:3000', headers: {} as any }))
    ).rejects.toBe(authError);
    expect(mockLoginRedirect).toHaveBeenCalledWith(loginRequest);
  });
});

describe('useAxiosAuthClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates an axios instance and registers both interceptors', () => {
    const { axiosClient, refreshAuthToken } = useAxiosAuthClient('http://localhost:3000');

    expect(axiosClient).toBe(mockAxiosInstance);
    expect(refreshAuthToken).toEqual(expect.any(Function));
    expect(mockRequestUse).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
    expect(mockResponseUse).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
  });

  it('refreshAuthToken force-refreshes the token for the current account', async () => {
    mockAcquireTokenSilent.mockResolvedValue({ accessToken: 'mock-token' });
    const { refreshAuthToken } = useAxiosAuthClient('http://localhost:3000');

    await refreshAuthToken();

    expect(mockAcquireTokenSilent).toHaveBeenCalledWith(
      expect.objectContaining({ account: { username: 'testuser' }, forceRefresh: true })
    );
  });

  it('refreshAuthToken is a no-op when no account is signed in', async () => {
    mockGetAllAccounts.mockReturnValueOnce([]);
    const { refreshAuthToken } = useAxiosAuthClient('http://localhost:3000');

    await expect(refreshAuthToken()).resolves.toBeUndefined();
    expect(mockAcquireTokenSilent).not.toHaveBeenCalled();
  });
});
