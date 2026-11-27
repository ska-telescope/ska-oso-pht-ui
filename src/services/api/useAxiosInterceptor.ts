import globalAxios from 'axios';
import { useLayoutEffect, useRef } from 'react';
import { useMsal } from '@azure/msal-react';
import { acquireAccessToken, createRequestInterceptor } from './auth';
import { isLocalhost, setLocalTokenProvider } from './localAuthToken';

/**
 * Registers a request interceptor on the global axios instance, which is what the generated
 * API clients in src/generated use, so their requests carry the MSAL bearer token.
 * Registered once on mount and ejected on unmount. The MSAL instance is held in a ref so that
 * it is read at request time rather than making the interceptor depend on its identity.
 *
 * On localhost it also registers the token provider that unauthenticated requests use to add a
 * bearer token, as the auth cookie isn't sent there (see localAuthToken).
 *
 * Registered in a layout effect so that it is in place before any child's mount effect
 * (which run later, as passive effects) makes its first request.
 *
 * Modelled on useAxiosInterceptor in ska-oso-odt-ui.
 */
export function useAxiosInterceptor() {
  const { instance } = useMsal();
  const instanceRef = useRef(instance);
  instanceRef.current = instance;

  useLayoutEffect(() => {
    const interceptorId = globalAxios.interceptors.request.use((request) =>
      createRequestInterceptor(instanceRef.current)(request)
    );
    if (isLocalhost()) {
      setLocalTokenProvider(async () => {
        const account = instanceRef.current.getAllAccounts()?.[0];
        return account ? acquireAccessToken(instanceRef.current, account) : null;
      });
    }

    return () => {
      globalAxios.interceptors.request.eject(interceptorId);
    };
  }, []);
}

export default useAxiosInterceptor;
