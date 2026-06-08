import axios from 'axios';
import { getLocalToken, isLocalhost } from '../authToken/localAuthToken';

export enum LogLevel {
  Error,
  Warning,
  Info,
  Verbose,
  Trace
}

const axiosClient = axios.create({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});

// On local deployments the auth cookie is not sent (different origin via the dev
// proxy), so attach a bearer token instead. No-op on remote deployments.
axiosClient.interceptors.request.use(async config => {
  if (isLocalhost()) {
    const token = await getLocalToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default axiosClient;
