import {
  clearLocalStorage,
  clickUserMenu,
  clickUserMenuProposals,
  clickUserMenuReviews,
  initialize,
  verifyUserMenuOverview,
  verifyUserMenuProposals,
  verifyUserMenuPanels,
  verifyUserMenuReviews,
  verifyUserMenuDecisions,
  mockOSDAPI,
  mockResolveTargetAPI,
  beginScienceIdeaSession,
  selectScienceVerificationCycle,
  completeScienceIdeaCreation,
  addM2TargetAndAutoLink,
  clickStatusIconNav,
  pageConfirmed,
  assignProposalToPanel
} from '../../common/common';
import { reviewerScience, standardUser } from '../users';

describe('Reviewer ( Science )', () => {
  describe('Menu', () => {
    beforeEach(() => {
      // The review list's title/wording is derived from the reviewed proposal's own cycle (see
      // ReviewListPage.tsx) - OSD cycle data must be mocked for that lookup to resolve.
      mockOSDAPI();
      initialize(reviewerScience);
      cy.wait('@mockOSDData');
    });

    afterEach(() => {
      clearLocalStorage();
    });

    //TODO Provision an 'Science Reviewer' test user and then reenable (see users.js).
    it.skip('Validate menu options', () => {
      clickUserMenu();
      verifyUserMenuOverview(false);
      verifyUserMenuProposals(true);
      verifyUserMenuPanels(false);
      verifyUserMenuReviews(true);
      verifyUserMenuDecisions(false);
    });

    it.skip('Navigate using the dropdown menu', () => {
      clickUserMenuProposals();
      clickUserMenuReviews();
    });
  });

  describe('Perform a review', () => {
    // Matches createSubmission.test.js's pattern (its beforeEach does the same thing).
    beforeEach(() => {
      mockResolveTargetAPI();
    });

    afterEach(() => {
      clearLocalStorage();
    });

    // No beforeEach login here (unlike the Menu tests above) - this test logs in itself, as a
    // different user (standardUser, via beginScienceIdeaSession), so a reviewerScience login
    // first would just be discarded work.
    //
    // Skipped via it.skip() (not this.skip()) - see
    // https://gitlab.com/ska-telescope/oso/ska-oso-pht-ui/-/jobs/16097676282: fails because
    // create_membership's User Portal call is a Prism mock in our CI/local minikube deploy (see
    // charts/ska-oso-services-umbrella/templates/mock-user-portal.yaml) that fakes success
    // without ever granting real Indigo group membership, so assignProposalToPanel 403s. Not a
    // test-code fix - re-enable once CI points at a real User Portal integration.
    //
    // it.skip() also sidesteps the this.skip()-inside-a-function-body issue described below,
    // since it.skip() never invokes the callback at all.
    //
    // This must be a plain arrow function, not function(){...this.skip()} - that combination,
    // with retries and cy.intercept().as() in mockOSDAPI/beginScienceIdeaSession, reliably
    // corrupted Cypress's command tracking into a spurious "child command before parent command"
    // CypressError on cy.as(...), even fully isolated with zero retries. this.skip() wasn't
    // gating any actual code (nothing followed it), so nothing is lost by dropping it.
    it.skip(
      'Science Verification: Perform a review, then validate and submit',
      { jiraKey: 'XTP-96332' },
      () => {
        // Creates as astronomer1, a normal PI, and stays astronomer1 for the rest of the flow -
        // create_proposal (ska-oso-services' prsls.py) already calls create_proposal_groups +
        // create_membership to grant the creator real admin membership on their own proposal, so
        // at this level there's nothing extra to do. That only actually lands astronomer1 in the
        // proposal's real Indigo group if create_membership's User Portal call is a working one -
        // our local minikube deploy's is a Prism mock (see
        // charts/ska-oso-services-umbrella/templates/mock-user-portal.yaml) that fakes success
        // without ever talking to real Indigo, so this flow will 403 here until that's pointed at
        // a real integration. Not a test-code fix.
        const title = `Cypress live review test ${Date.now()}`;

        beginScienceIdeaSession(standardUser);
        selectScienceVerificationCycle();
        completeScienceIdeaCreation(title);

        // Investigator seeding removed for now (see seedSelfAsInvestigator in common.js, still
        // available if needed again) - should be redundant once create_membership above is
        // actually granting real membership, so not worth carrying as dead weight while that's
        // still unresolved.

        // assignProposalToPanel uses sciops1 (Ralph Copeland)'s own token internally, via
        // app:pht:ops_proposal_admin - see its comment in common.js. pnl-b2 must exist as a real
        // seeded panel wherever this suite runs; against a fresh/empty local ODA (e.g. a
        // throwaway minikube deploy)
        cy.get('@mockCreateSVIdea')
          .its('response.body.prsl_id')
          .then((prslId) => assignProposalToPanel('pnl-b2', prslId));

        addM2TargetAndAutoLink('Continuum', 'This is a summary of the science idea.');
        clickStatusIconNav('statusId3'); //Click to description page
        pageConfirmed('DESCRIPTION');

        // Stops here deliberately - the remaining flow (PDF upload) needs real AWS S3
        // credentials sourced from Vault in a proper deployment; a local minikube deploy of
        // ska-oso-services runs with vault.enabled=false (see its Makefile), which injects a
        // dummy AWS key/secret instead, so any live upload fails there. Not a test-code fix.
      }
    );
  });
});
