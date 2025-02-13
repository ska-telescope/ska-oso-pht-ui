import axios from 'axios';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';

export enum LogLevel {
  Error,
  Warning,
  Info,
  Verbose,
  Trace
}

export const loginRequest = {
  scopes: ['User.Read']
};

export const useAxiosAuthClient = (baseURL: string) => {
  const { instance } = useMsal();

  const axiosClient = axios.create({
    baseURL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  });

  axiosClient.interceptors.request.use(
    async request => {
      const isLocalhost =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isHttp = request?.baseURL?.startsWith('http://');

      if (isHttp && !isLocalhost) {
        return Promise.reject('HTTP is not allowed except on localhost.');
      }

      if (!isHttp && request?.baseURL?.startsWith('http://')) {
        request.baseURL = request.baseURL.replace('http://', 'https://');
      }

      const account = instance.getAllAccounts()[0];
      if (account) {
        try {
          const tokenResponse = await instance.acquireTokenSilent({
            ...loginRequest,
            account: account
          });
          request.headers['Authorization'] = `Bearer ${tokenResponse.accessToken}`;
        } catch (error) {
          console.error('Error acquiring token silently:', error);
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

  return axiosClient;
};

export default useAxiosAuthClient;
