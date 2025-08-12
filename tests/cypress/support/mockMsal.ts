import * as msal from '@azure/msal-browser';

export function mockMsalToken() {
  const mockAccount = {
    username: 'test@example.com',
    homeAccountId: 'test-id',
  };

  cy.stub(msal.PublicClientApplication.prototype, 'getAllAccounts').returns([mockAccount]);
  cy.stub(msal.PublicClientApplication.prototype, 'getActiveAccount').returns(mockAccount);
  cy.stub(msal.PublicClientApplication.prototype, 'acquireTokenSilent').resolves({
    accessToken: 'mock-access-token',
  });
}
