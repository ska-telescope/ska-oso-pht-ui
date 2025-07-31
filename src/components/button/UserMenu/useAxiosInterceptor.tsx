import globalAxios from 'axios';
import { UseGetToken } from '@ska-telescope/ska-login-page';
import { MSENTRA_REDIRECT_URI } from '@/utils/constants';

export function useAxiosInterceptor() {
  const getToken = UseGetToken();

  const SCOPES = [`api://${MSENTRA_REDIRECT_URI}/pht:readwrite`];

  const setUpAxiosInterceptor = () => {
    globalAxios.interceptors.request.use(async request => {
      const isHttps = request.url?.startsWith('https://');

      if (!isHttps && !isLocalHost()) {
        return Promise.reject('HTTPS must be used, except on localhost.');
      }

      const accessToken = await getToken({ scopes: SCOPES });
      request.headers.Authorization = `Bearer ${accessToken}`;
      return request;
    });
  };

  return setUpAxiosInterceptor;
}

const isLocalHost = () =>
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
