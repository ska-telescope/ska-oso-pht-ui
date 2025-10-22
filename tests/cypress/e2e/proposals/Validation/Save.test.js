import {
  clearLocalStorage,
  clickAddProposal,
  clickCreateProposal,
  clickCycleConfirm,
  clickProposalTypePrincipleInvestigator,
  clickSave,
  clickSubProposalTypeTargetOfOpportunity,
  enterProposalTitle,
  initialize,
  mockCreateProposalAPI,
  verifyProposalCreatedAlertFooter
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

describe('Proposal Save API', () => {
  beforeEach(() => {
    initialize(standardUser);
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('sends correct payload and receives expected response', () => {
    // Spy on the real POST request
    cy.intercept('POST', '**/pht/prsls/create').as('createProposalAPI');

    // Spy on the real PUT request
    cy.intercept('PUT', '**/pht/prsls/prsl-t0001-20251021-00003').as('saveProposal');

    clickAddProposal();
    clickCycleConfirm();
    enterProposalTitle();
    clickProposalTypePrincipleInvestigator();
    clickSubProposalTypeTargetOfOpportunity();
    clickCreateProposal();
    // Wait for the request and inspect it
    cy.wait('@createProposalAPI').then(interception => {
      // Verify the payload sent from the UI
      expect(interception.request.body).to.deep.equal({
        status: 'draft',
        submitted_by: '',
        submitted_on: null,
        investigator_refs: [],
        cycle: 'SKAO_2027_1',
        proposal_info: {
          title: 'Proposal Title',
          proposal_type: { main_type: 'standard_proposal', attributes: ['target_of_opportunity'] },
          abstract: '',
          investigators: [
          ]
        },
        observation_info: {
          targets: [],
          documents: [],
          observation_sets: [],
          data_product_sdps: [],
          data_product_src_nets: [],
          result_details: []
        }
      });
      // Verify the actual response from the API
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body).to.have.property('prsl_id', 'prsl-t0001-20251022-00001');
    });
    // verifyProposalCreatedAlertFooter();
    // clickSave();
    //
    // // Wait for the request and inspect it
    // cy.wait('@saveProposal').then(interception => {
    //   // Verify the payload sent from the UI
    //   expect(interception.request.body).to.deep.equal({
    //     name: 'Alice',
    //     email: 'alice@example.com',
    //     message: 'Hello from Cypress!'
    //   });
    //
    //   // Verify the actual response from the API
    //   expect(interception.response.statusCode).to.eq(200);
    //   expect(interception.response.body).to.have.property('success', true);
    // });
    //
    // // Optionally verify UI behavior based on response
    // // cy.contains('Thank you for your message');
  });
});
