import { describe, test, expect } from 'vitest';
import { isAuthResponseForAnotherWindow } from './authRedirectBridge';

const msalState = (interactionType: string) =>
  encodeURIComponent(btoa(JSON.stringify({ id: 'abc', meta: { interactionType } })));

const makeWindow = (search = '', hash = '') => ({ location: { search, hash } }) as Window;

describe('isAuthResponseForAnotherWindow', () => {
  test('is true for a code response to a silent request', () => {
    expect(
      isAuthResponseForAnotherWindow(makeWindow(`?code=abc&state=${msalState('silent')}`))
    ).toBe(true);
  });

  test('is true for an error response to a silent request', () => {
    expect(
      isAuthResponseForAnotherWindow(
        makeWindow(`?error=login_required&state=${msalState('silent')}`)
      )
    ).toBe(true);
  });

  test('is true for a popup response in the hash', () => {
    expect(
      isAuthResponseForAnotherWindow(makeWindow('', `#code=abc&state=${msalState('popup')}`))
    ).toBe(true);
  });

  test('is false for a full-page login redirect', () => {
    expect(
      isAuthResponseForAnotherWindow(makeWindow(`?code=abc&state=${msalState('redirect')}`))
    ).toBe(false);
  });

  test('is false without an auth response', () => {
    expect(isAuthResponseForAnotherWindow(makeWindow('?use_indigo=true'))).toBe(false);
  });

  test('is false without a state', () => {
    expect(isAuthResponseForAnotherWindow(makeWindow('?code=abc'))).toBe(false);
  });

  test('is false for a state that is not from MSAL', () => {
    expect(isAuthResponseForAnotherWindow(makeWindow('?code=abc&state=not-base64-json'))).toBe(
      false
    );
  });
});
