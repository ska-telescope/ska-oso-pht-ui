import {
  clickAddProposal,
  clickCreateProposal,
  clickHome,
  clickProposalTypePrincipleInvestigator,
  clickSubProposalTypeTargetOfOpportunity,
  initialize,
  enterProposalTitle,
  verifyFirstProposalOnLandingPageIsVisible,
  verifyOnLandingPage,
  verifyOnLandingPageFilterIsVisible,
  verifyProposalCreatedAlertFooter,
  clickLoginUser
} from '../common/common';
import { DUMMY_PROPOSAL_ID } from '../../../../src/utils/constants.js';

describe('Creating Proposal', () => {
  beforeEach(() => {
    initialize();
    cy.mockLoginButton();
    //intercept the postProposal request
    cy.window().then((win) => {
      const token = win.localStorage.getItem('msal.idtoken');
      console.log('token ', token);
      cy.intercept('POST', '/create', (req) => {
        req.headers['Authorization'] = `Bearer ${token}`;
        req.reply({
          statusCode: 200,
          body: 'PROPOSAL-ID-001'
        });
      }).as('createProposal');
    });
  });
  it('Create a basic proposal', { jiraKey: 'XTP-59739' }, () => {
    clickLoginUser();

    clickAddProposal();
    enterProposalTitle();
    clickProposalTypePrincipleInvestigator();
    clickSubProposalTypeTargetOfOpportunity();

    // Step 3: Click the button that triggers the POST
    clickCreateProposal();

    // Step 4: Wait for the intercepted request
    cy.wait('@createProposal');

    verifyProposalCreatedAlertFooter();
    clickHome();
    verifyOnLandingPage();
    verifyOnLandingPageFilterIsVisible();
    verifyFirstProposalOnLandingPageIsVisible();
  });
});
