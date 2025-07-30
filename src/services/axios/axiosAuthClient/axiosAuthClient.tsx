import axios, { AxiosError } from 'axios';
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

const useAxiosAuthClient = (baseURL: string = '/') => {
  // TODO: pull baseURL from somewhere else
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
      const isHttp = request?.baseURL?.startsWith('http://');

      // Correct logic: Allow HTTP ONLY on localhost.  Otherwise, force HTTPS.
      if (isHttp && !isLocalhost) {
        return Promise.reject('HTTP is not allowed except on localhost.');
      } else if (
        isHttp &&
        !isLocalhost &&
        request.baseURL &&
        !request.baseURL.startsWith('https://')
      ) {
        request.baseURL = request.baseURL.replace('http://', 'https://');
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
          // console.error('Error acquiring token silently:', error);
          if (error instanceof InteractionRequiredAuthError) {
            instance.loginRedirect({
              ...loginRequest,
              redirectUri: window.location.origin
            });
          }
          return Promise.reject(error); // Re-reject the error
        }
      }
      return request;
    },
    error => Promise.reject(error) // Re-reject the error
  );

  axiosClient.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
      if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
        // console.error('Request timed out:', error);
        // Handle timeout error, e.g., retry, show a message, etc.
        return Promise.reject(new Error('Request timed out. Please try again.')); // More user-friendly message
      } else if (error.code === 'ESOCKETTIMEDOUT') {
        // console.error('Socket timeout:', error);
        return Promise.reject(
          new Error('Connection timed out. Please check your internet connection and try again.')
        );
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        // console.error('Response error:', error.response.status, error.response.data);
        return Promise.reject(
          new Error(`Server responded with an error: ${error.response.status}`)
        ); // More informative error
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        // console.error('Request error (no response):', error.request);
        return Promise.reject(new Error('No response received from the server.'));
      } else {
        // Something happened in setting up the request that triggered an Error
        // console.error('Request setup error:', error.message);
        return Promise.reject(new Error(`An error occurred: ${error.message}`)); // Generic error message
      }
    }
  );

  return axiosClient;
};

export default useAxiosAuthClient;
