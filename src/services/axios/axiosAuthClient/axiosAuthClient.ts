import axios, { AxiosError, AxiosInstance } from 'axios';
import { useMsal } from '@azure/msal-react';
import {
  acquireAccessToken,
  createRefreshAuthToken,
  createRequestInterceptor,
  getRequestTimeoutMs,
  mapAxiosError
} from '@/services/api/auth';
import { isLocalhost, setLocalTokenProvider } from '@/services/api/localAuthToken';

// TODO: Legacy. Each caller passes this client to a hand-written service; they move to the API
// layer in src/services/api one domain at a time, and this file goes with the last of them.

// The axios client returned by useAxiosAuthClient, for callers that only need it for typing
export type AxiosAuthClient = AxiosInstance;

const useAxiosAuthClient = (baseURL: string = '/') => {
  const { instance } = useMsal();

  // On localhost the auth cookie isn't sent, so register a token provider that
  // the shared (unauthenticated) axiosClient uses to add a bearer token instead.
  // No-op on remote deployments.
  if (isLocalhost()) {
    setLocalTokenProvider(async () => {
      const account = instance.getAllAccounts()?.[0];
      return account ? acquireAccessToken(instance, account) : null;
    });
  }

  const refreshAuthToken = createRefreshAuthToken(instance);

  const axiosClient = axios.create({
    baseURL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    timeout: getRequestTimeoutMs()
  });

  axiosClient.interceptors.request.use(createRequestInterceptor(instance), (error) =>
    Promise.reject(error)
  );

  axiosClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => Promise.reject(mapAxiosError(error))
  );

  return { axiosClient, refreshAuthToken };
};

export default useAxiosAuthClient;
