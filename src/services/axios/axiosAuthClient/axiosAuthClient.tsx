import axios from 'axios';
import { useMsal } from '@azure/msal-react';

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
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});

export default authAxiosClient;
