import { defaultUser } from '../users.js';
import {
  clearLocalStorage,
  createStandardProposalLoggedIn,
  mockCreateProposalAPI,
  mockEmailAPI,
  pageConfirmed,
  initialize,
  verifyProposalCreatedAlertFooter
} from '../../common/common.js';

describe('Delegate Editing Rights', () => {
  beforeEach(() => {
    initialize(defaultUser);
    mockCreateProposalAPI();
    cy.window().then(win => {
      win.localStorage.setItem('cypress:defaultUserLoggedIn', 'true');
    });
    mockEmailAPI();
    createStandardProposalLoggedIn();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  //TODO: Add new jira/xray key
  it('Create a basic proposal', { jiraKey: 'XTP-59739' }, () => {
    cy.wait('@mockCreateProposal');
    verifyProposalCreatedAlertFooter();
    pageConfirmed('TEAM');
  });
});
