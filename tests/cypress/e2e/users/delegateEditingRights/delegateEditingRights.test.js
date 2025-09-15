import { defaultUser } from '../users.js';
import {
  clearLocalStorage,
  createStandardProposalLoggedIn,
  mockCreateProposalAPI,
  mockEmailAPI,
  pageConfirmed,
  initialize,
  verifyProposalCreatedAlertFooter,
  clickSearchForMember,
  clickUserSearch,
  clickPICheckbox,
  clickSendInviteButton
} from '../../common/common.js';
import { entry } from '../../../fixtures/utils/cypress.js';

describe('Delegate Editing Rights', () => {
  beforeEach(() => {
    initialize(defaultUser);
    mockCreateProposalAPI();
    cy.window().then(win => {
      win.localStorage.setItem('cypress:defaultUserLoggedIn', 'true');
    });
    mockEmailAPI();
    createStandardProposalLoggedIn();
    cy.wait('@mockCreateProposal');
    verifyProposalCreatedAlertFooter();
    pageConfirmed('TEAM');
  });

  afterEach(() => {
    clearLocalStorage();
  });

  //TODO: Add new jira/xray key
  it('Delegate editing rights to a co-investigator', { jiraKey: 'XTP-' }, () => {
    clickSearchForMember();
    entry('email', 'Trevor.Swain@community.skao.int');
    clickUserSearch();
    clickPICheckbox();
    clickSendInviteButton();
  });
});
