import { createObservation, createStandardProposal, initialize } from '../common/common';
beforeEach(() => {
  initialize();
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
