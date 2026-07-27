import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import useAxiosAuthClient, {
  createRequestInterceptor,
  loginRequest,
  mapAxiosError
} from './axiosAuthClient';

vi.stubGlobal('window', {
  location: { hostname: 'localhost', origin: 'http://localhost:3000' }
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

vi.mock('axios', async importOriginal => {
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

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAllAccounts.mockReturnValue([{ username: 'testuser' }]);
    (window as any).location.hostname = 'localhost';
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

  it('passes the request through unchanged when no account is signed in', async () => {
    mockGetAllAccounts.mockReturnValue([]);
    const interceptor = createRequestInterceptor(mockInstance);
    const request = asRequestConfig({ baseURL: 'http://localhost:3000', headers: {} as any });

    const result = await interceptor(request);

    expect(result).toBe(request);
    expect(mockAcquireTokenSilent).not.toHaveBeenCalled();
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
    const client = useAxiosAuthClient('http://localhost:3000');

    expect(client).toBe(mockAxiosInstance);
    expect(mockRequestUse).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
    expect(mockResponseUse).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
  });
});
