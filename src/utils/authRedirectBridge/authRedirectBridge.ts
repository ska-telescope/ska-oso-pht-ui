// MSAL v5 runs silent token requests in a hidden iframe (and popups in a separate window), and
// waits for the page Indigo redirects that frame to to send it the response with
// broadcastResponseToMainFrame(). Without that, every silent request that needs Indigo (a forced
// refresh, or renewing an expired token - Indigo issues no refresh tokens) waits 10 seconds and
// fails. The redirect URI is the app itself, so main.tsx checks this before rendering and hands
// the response over instead of starting the app inside the frame.

const getAuthResponseParams = (location: Pick<Location, 'search' | 'hash'>): URLSearchParams => {
  const params = new URLSearchParams(location.search);
  new URLSearchParams(location.hash.replace(/^#/, '')).forEach((value, key) =>
    params.append(key, value)
  );
  return params;
};

// MSAL puts the kind of request in the state it sends to Indigo, as base64 JSON:
// {"id": "...", "meta": {"interactionType": "redirect" | "silent" | "popup"}}
const getInteractionType = (state: string): string | undefined => {
  try {
    const base64 = state.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64))?.meta?.interactionType;
  } catch {
    return undefined;
  }
};

// A full-page login redirect also lands here with an auth response, but the app itself handles
// that one via MSAL's handleRedirectPromise(), so only silent and popup responses are passed on.
// This goes by MSAL's state rather than by checking for an iframe, because Cypress runs the whole
// app inside an iframe.
export const isAuthResponseForAnotherWindow = (win: Pick<Window, 'location'>): boolean => {
  const params = getAuthResponseParams(win.location);
  const state = params.get('state');
  if (!state || !(params.has('code') || params.has('error'))) {
    return false;
  }
  const interactionType = getInteractionType(state);
  return interactionType === 'silent' || interactionType === 'popup';
};
