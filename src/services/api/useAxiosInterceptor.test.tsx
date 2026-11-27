import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import globalAxios from 'axios';
import { useAxiosInterceptor } from './useAxiosInterceptor';
import { getLocalToken, setLocalTokenProvider } from './localAuthToken';

const { mockInstance, mockCreateRequestInterceptor, mockAcquireAccessToken } = vi.hoisted(() => ({
  mockInstance: { name: 'msal-instance', getAllAccounts: () => [{ username: 'testuser' }] },
  mockCreateRequestInterceptor: vi.fn(),
  mockAcquireAccessToken: vi.fn()
}));

vi.mock('@azure/msal-react', () => ({
  useMsal: () => ({ instance: mockInstance })
}));

vi.mock('./auth', () => ({
  acquireAccessToken: mockAcquireAccessToken,
  createRequestInterceptor: mockCreateRequestInterceptor
}));

describe('useAxiosInterceptor', () => {
  const use = vi.spyOn(globalAxios.interceptors.request, 'use');
  const eject = vi.spyOn(globalAxios.interceptors.request, 'eject');

  beforeEach(() => {
    vi.clearAllMocks();
    use.mockReturnValue(42);
    mockCreateRequestInterceptor.mockReturnValue(async (request: unknown) => request);
  });

  it('registers one interceptor on the global axios instance on mount', () => {
    renderHook(() => useAxiosInterceptor());

    expect(use).toHaveBeenCalledOnce();
  });

  it('does not re-register on re-render', () => {
    const { rerender } = renderHook(() => useAxiosInterceptor());
    rerender();
    rerender();

    expect(use).toHaveBeenCalledOnce();
  });

  it('ejects the interceptor on unmount', () => {
    const { unmount } = renderHook(() => useAxiosInterceptor());
    unmount();

    expect(eject).toHaveBeenCalledExactlyOnceWith(42);
  });

  it('builds the request interceptor from the MSAL instance when a request is made', async () => {
    renderHook(() => useAxiosInterceptor());
    const registered = use.mock.calls[0][0] as (request: unknown) => Promise<unknown>;
    const request = { url: '/oso' };

    await expect(registered(request)).resolves.toBe(request);
    expect(mockCreateRequestInterceptor).toHaveBeenCalledWith(mockInstance);
  });

  // jsdom runs on localhost, where the auth cookie isn't sent
  it('registers the localhost token provider for unauthenticated requests', async () => {
    setLocalTokenProvider(null);
    mockAcquireAccessToken.mockResolvedValue('token-1');

    renderHook(() => useAxiosInterceptor());

    await expect(getLocalToken()).resolves.toBe('token-1');
    expect(mockAcquireAccessToken).toHaveBeenCalledWith(mockInstance, { username: 'testuser' });
  });
});
