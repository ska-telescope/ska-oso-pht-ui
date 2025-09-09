import { createObservation, createStandardProposal, initialize } from '../common/common';
import { defaultUser } from '../users/users.js';
beforeEach(() => {
  initialize(defaultUser);
  cy.window().then(win => {
    win.localStorage.setItem('proposal:noLogin', 'true');
  });
  createStandardProposal();
});

describe('Creating Observation', () => {
  it('Create a default observation', { jiraKey: 'XTP-71406' }, () => {
    createObservation();
  });
});
