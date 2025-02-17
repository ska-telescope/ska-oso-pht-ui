import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';

/**
 * Custom hook to create an authenticated API client.
 *
 * Provides a function to make API calls with the access token included in the headers.
 *
 * @returns A function to make authenticated API calls.
 */
export const useAPIClient = () => {
  const { instance, accounts } = useMsal();

  const loginRequest = {
    scopes: ['User.Read']
  };

  /**
   * Acquires an access token silently, or prompts the user if interaction is required.
   *
   * @returns The access token.
   * @throws Error if token acquisition fails.
   */
  const getToken = async (): Promise<string> => {
    if (accounts.length > 0) {
      try {
        const response = await instance.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0]
        });
        return response.accessToken;
      } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
          // Redirect to login page for interactive login
          await instance.acquireTokenRedirect(loginRequest);
          return ''; // Return empty string after redirecting
        } else {
          console.error('Failed to acquire token silently:', error);
          throw error; // Throw error to be handled by the caller
        }
      }
    } else {
      const errorMessage = 'No accounts available to acquire token.';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Makes an API call with the access token included in the Authorization header.
   *
   * @param url - The API endpoint URL.
   * @param options - Additional fetch options.
   * @returns The fetch response.
   * @throws Error if the access token cannot be acquired or the fetch fails.
   */
  const authApiClient = async (url: string, options: RequestInit = {}): Promise<Response> => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Access token is empty.');
      }

      const headers = new Headers(options.headers || {});
      headers.append('Authorization', `Bearer ${token}`);
      options.headers = headers;

      const response = await fetch(url, options);

      if (!response.ok) {
        // Optionally handle HTTP errors
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('Failed to make authenticated API call:', error);
      throw error;
    }
  };

  return authApiClient;
};

export default useAPIClient;
