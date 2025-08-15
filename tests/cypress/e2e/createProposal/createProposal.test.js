import {
  clickAddProposal,
  clickCreateProposal,
  clickHome,
  clickProposalTypePrincipleInvestigator,
  clickSubProposalTypeTargetOfOpportunity,
  initialize,
  enterProposalTitle,
  verifyOnLandingPage,
  verifyOnLandingPageFilterIsVisible,
  verifyProposalCreatedAlertFooter,
  clickLoginUser, verifyMockedProposalOnLandingPageIsVisible
} from '../common/common';

describe('Creating Proposal', () => {
  beforeEach(() => {
    initialize();
    cy.mockLoginButton();
    //mock create proposal endpoint
    cy.window().then(win => {
      const token = win.localStorage.getItem('cypress:token');
      cy.intercept('POST', 'http://192.168.49.2/ska-oso-services/oso/api/v2/pht/prsls/create', (req) => {
        req.headers['Authorization'] = `Bearer ${token}`;
        req.reply({
          statusCode: 200,
          body: "prsl-test-20250814-00003",
        });
      }).as('mockCreateProposal');
    });
  });
  it('Create a basic proposal', { jiraKey: 'XTP-59739' }, () => {
    clickLoginUser();

    clickAddProposal();
    enterProposalTitle();
    clickProposalTypePrincipleInvestigator();
    clickSubProposalTypeTargetOfOpportunity();
    clickCreateProposal();
    cy.wait('@mockCreateProposal');
    verifyProposalCreatedAlertFooter();
    clickHome();
    verifyOnLandingPage();
    verifyOnLandingPageFilterIsVisible();
    verifyMockedProposalOnLandingPageIsVisible();
  });
});
