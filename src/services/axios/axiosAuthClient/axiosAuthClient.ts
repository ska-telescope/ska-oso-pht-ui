import axios, { AxiosError } from 'axios';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { MSENTRA_API_URI } from '@/utils/constants';

export enum LogLevel {
  Error,
  Warning,
  Info,
  Verbose,
  Trace
}

const HTTP = 'http://';
const HTTPS = 'https://';

export const loginRequest = {
  scopes: [`${MSENTRA_API_URI}/pht:readwrite ${MSENTRA_API_URI}/pht:update `]
};

const useAxiosAuthClient = (baseURL: string = '/') => {
  const { instance } = useMsal();

  const axiosClient = axios.create({
    baseURL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    timeout: 10000
  });

  axiosClient.interceptors.request.use(
    async request => {
      const isLocalhost =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isHttp = request?.baseURL?.startsWith(HTTP);
      if (isHttp && !isLocalhost) {
        return Promise.reject('HTTP is not allowed except on localhost.');
      } else if (isHttp && !isLocalhost && request.baseURL && !request.baseURL.startsWith(HTTPS)) {
        request.baseURL = request.baseURL.replace(HTTP, HTTPS);
      }

      const account = instance.getAllAccounts()[0];
      if (account) {
        try {
          const tokenResponse = await instance.acquireTokenSilent({
            ...loginRequest,
            account
          });
          request.headers['Authorization'] = `Bearer ${tokenResponse.accessToken}`;
        } catch (error) {
          if (error instanceof InteractionRequiredAuthError) {
            instance.loginRedirect({
              ...loginRequest,
              redirectUri: window.location.origin
            });
          }
          return Promise.reject(error);
        }
      }
      return request;
    },
    error => Promise.reject(error)
  );

  axiosClient.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
      if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
        return Promise.reject(new Error('Request timed out. Please try again.'));
      } else if (error.code === 'ESOCKETTIMEDOUT') {
        return Promise.reject(
          new Error('Connection timed out. Please check your internet connection and try again.')
        );
      } else if (error.response) {
        return Promise.reject(
          new Error(`Server responded with an error: ${error.response.status}`)
        );
      } else if (error.request) {
        return Promise.reject(new Error('No response received from the server.'));
      } else {
        return Promise.reject(new Error(`An error occurred: ${error.message}`));
      }
    }
  );

  return axiosClient;
};

export default useAxiosAuthClient;
