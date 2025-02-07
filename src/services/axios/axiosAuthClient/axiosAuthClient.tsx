import axios from 'axios';
import { useMsal } from '@azure/msal-react';
import { SKA_PHT_API_URL } from '../../../utils/constants';

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

const authAxiosClient = axios.create({
  baseURL: SKA_PHT_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});

authAxiosClient.interceptors.request.use(
  async request => {
    if (request?.baseURL?.includes('http://')) {
      return Promise.reject('http was used, you must use https');
    }
    const { instance } = useMsal();
    const account = instance.getActiveAccount();
    if (account) {
      const tokenResponse = await instance.acquireTokenSilent({
        ...loginRequest,
        account: account
      });
      request.headers['Authorization'] = `Bearer ${tokenResponse.accessToken}`;
    }
    return request;
  },
  error => {
    return Promise.reject(error);
  }
);

export default authAxiosClient;
