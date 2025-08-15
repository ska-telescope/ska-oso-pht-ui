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

describe('Creating Proposal', () => {
  beforeEach(() => {
    initialize();
    cy.mockLoginButton();
  });
  it('Create a basic proposal', { jiraKey: 'XTP-59739' }, () => {
    clickLoginUser();

    clickAddProposal();
    enterProposalTitle();
    clickProposalTypePrincipleInvestigator();
    clickSubProposalTypeTargetOfOpportunity();
    //mock create proposal endpoint
    cy.window().then(win => {
      const token = win.localStorage.getItem('cypress:token');
      console.log('token ', token);
    cy.intercept('POST', 'http://192.168.49.2/ska-oso-services/oso/api/v2/pht/prsls/create', (req) => {
      req.headers['Authorization'] = `Bearer ${token}`;
      req.reply({
        statusCode: 200,
        body: "prsl-test-20250814-00003",
      });
    }).as('mockCreateProposal');
    });
    clickCreateProposal();
    cy.wait('@mockCreateProposal');
    verifyProposalCreatedAlertFooter();
    //mock get proposal list
    cy.window().then(win => {
      const token = win.localStorage.getItem('cypress:token');
      console.log('token ', token);
      cy.intercept('GET', 'http://192.168.49.2/ska-oso-services/oso/api/v2/pht/prsls/mine', (req) => {
        req.headers['Authorization'] = `Bearer ${token}`;
        req.reply({
          statusCode: 200,
          body: "prsl-test-20250814-00003",
        });
      }).as('mockGetProposalsList');
    });
    clickHome();
    cy.wait('@mockGetProposalsList');
    verifyOnLandingPage();
    verifyOnLandingPageFilterIsVisible();
    verifyFirstProposalOnLandingPageIsVisible();
  });
});
