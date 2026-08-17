import {
  clearLocalStorage,
  clickUserMenu,
  clickUserMenuProposals,
  clickUserMenuReviews,
  clickUserMenuPanels,
  initialize,
  verifyUserMenuOverview,
  verifyUserMenuProposals,
  verifyUserMenuPanels,
  verifyUserMenuReviews,
  verifyUserMenuDecisions,
  clickIconForRow,
  clickConfirmButtonWithinPopup,
  clickRank9,
  clickGeneralCommentsTab,
  clickToValidateSV,
  verifyAlertFooter,
  mockOSDAPIWithReviewCycle,
  isLiveMode,
  beginScienceIdeaSession,
  selectMostRecentSVCycle,
  completeScienceIdeaCreation,
  addM2TargetAndAutoLink,
  mockResolveTargetAPI,
  mockValidateSVIdeaAPI,
  clickToConfirmProposalSubmission,
  withdrawProposal,
  clickStatusIconNav,
  pageConfirmed,
  uploadTestFile,
  verifyTestFileUploaded,
  clickFileUpload
} from '../../common/common';
import { reviewerScience, reviewerAdmin, standardUser } from '../users';
import { entry } from '../../../fixtures/utils/cypress.js';

describe('Reviewer ( Science )', () => {
  beforeEach(() => {
    // The review list's title/wording is derived from the reviewed proposal's own cycle (see
    // ReviewListPage.tsx) - OSD cycle data must be mocked for that lookup to resolve.
    mockOSDAPIWithReviewCycle();
    initialize(reviewerScience);
    cy.wait('@mockOSDData');
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('Validate menu options', () => {
    clickUserMenu();
    verifyUserMenuOverview(false);
    verifyUserMenuProposals(true);
    verifyUserMenuPanels(false);
    verifyUserMenuReviews(true);
    verifyUserMenuDecisions(false);
  });

  it('Navigate using the dropdown menu', () => {
    clickUserMenuProposals();
    clickUserMenuReviews();
  });

  it(
    'Science Verification: Perform a review, then validate and submit',
    { jiraKey: 'XTP-96332' },
    function () {
      if (isLiveMode()) {
        // Blocked on IAM group grants for the shared live test account (astronomer1) - request
        // in progress. Reviewing a genuine live SV idea (rather than the mocked "In a galaxy
        // far, far away" fixture) needs three real backend actions that the account can't
        // perform yet:
        //   - POST /panels/assignments (creates the review record in the first place) needs
        //     Role.OPS_PROPOSAL_ADMIN or Role.SW_ENGINEER (panels.py)
        //   - PUT /reviews/{id} (submitting the review itself) needs Role.SW_ENGINEER,
        //     Role.OPS_REVIEWER_SCIENCE, or Role.OPS_REVIEWER_TECHNICAL (reviews.py)
        // Neither role is granted by any of astronomer1's current IAM groups (see
        // ska_aaa_authhelpers's INDIGO_ROLE_GRANTING_GROUPS) - we've asked for
        // role/ops_proposal_admin and role/ops_reviewer_science to be added to that account.
        // The flow below is otherwise complete and should just start working once that lands -
        // remove this skip (and verify it) at that point rather than rewriting it from scratch.
        //
        // One more thing worth checking once it's unblocked: get_proposals_by_status
        // (/pht/prsls/reviewable, prsls.py) has its own separate, hand-rolled group check
        // (is_admin/is_chair/has_review_group via PrslRole) that compares against Entra ID
        // group *UUIDs*, not the Indigo "role/..." group names ska_aaa_authhelpers otherwise
        // understands. An Indigo-issued token may never satisfy that check regardless of which
        // Indigo groups the account has, which would make this endpoint return an empty list
        // even with the roles above granted - if that turns out to be the case it's a backend
        // gap, not a test-code one.
        //
        // Also blocked, independently, on the same S3/Vault dummy-secret issue as the other
        // upload-dependent live specs (see createSubmission.test.js) - the PDF upload below is
        // required to reach a submittable/valid SV idea at all, so this needs both fixes before
        // it can actually run, not just the IAM grant.
        this.skip();

        // Unreachable until the skip above is removed - kept complete and ready rather than
        // written from scratch once this is unblocked.
        const title = `Cypress live review test ${Date.now()}`;
        let prslId;

        // 1. Submit a real SV idea as an investigator, under whichever Science Verification
        // cycle is actually current on the real backend (not a hardcoded/fixture cycle - see
        // selectMostRecentSVCycle).
        mockResolveTargetAPI();
        mockValidateSVIdeaAPI();
        beginScienceIdeaSession(standardUser);
        selectMostRecentSVCycle();
        completeScienceIdeaCreation(title);
        addM2TargetAndAutoLink('Continuum', 'This is a summary of the science idea.');
        clickStatusIconNav('statusId3'); //Click to description page
        pageConfirmed('DESCRIPTION');
        uploadTestFile('testFile.pdf');
        verifyTestFileUploaded('testFile.pdf');
        clickFileUpload();
        verifyAlertFooter('Science Justification PDF successfully uploaded');
        clickToValidateSV();
        cy.wait('@mockValidateSVIdea');
        verifyAlertFooter('Science Verification Idea is Valid');
        clickToConfirmProposalSubmission();
        verifyAlertFooter('Submission was successful');

        cy.get('@mockCreateSVIdea')
          .its('response.body.prsl_id')
          .then((id) => {
            prslId = id;
          });

        // 2. As proposal admin, ensure the Science Verification panel exists (GridReviewPanels
        // auto-generates it on load if the panel list is empty) and assign submitted proposals
        // to it - this is what actually creates the review record the next step needs. Assumes
        // the OSD cycle selected on this page is the SV one used above; if the admin's own
        // default cycle selection differs, POST /panels/assignments' name-based SV match
        // (panels.py) would silently fall through to category-based assignment instead.
        mockOSDAPIWithReviewCycle();
        initialize(reviewerAdmin);
        cy.wait('@mockOSDData');
        clickUserMenuPanels();
        cy.get('[data-testid="assignButtonTestId"]').click();

        // 3. As the science reviewer, find and review the proposal we just created (by its own
        // unique title, not a fixture-only one).
        mockOSDAPIWithReviewCycle();
        initialize(reviewerScience);
        cy.wait('@mockOSDData');
        clickUserMenuReviews();
        clickIconForRow('dataGridId', 'scienceIcon', title);
        clickConfirmButtonWithinPopup();
        clickRank9();
        clickGeneralCommentsTab('General Comments');
        entry('generalCommentsId', 'This is a general comment for the submission');
        clickToValidateSV();
        verifyAlertFooter('Review record has been updated');

        // 4. Teardown - withdraw the real proposal so repeated runs don't accumulate test data
        // in a shared environment's reviewable queue (see withdrawProposal's own comment for why
        // this goes via a direct API call rather than the UI).
        cy.then(() => withdrawProposal(prslId));
      } else {
        clickUserMenuReviews();
        //Click on the review for the submission "In a galaxy far, far away"
        clickIconForRow('dataGridId', 'scienceIcon', 'In a galaxy far, far away');
        //confirm no conflict of interest
        clickConfirmButtonWithinPopup();
        //select rank and add general comments
        clickRank9();
        clickGeneralCommentsTab('General Comments');
        entry('generalCommentsId', 'This is a general comment for the submission');
        //click validate / submit
        clickToValidateSV();
        verifyAlertFooter('Review record has been updated');
      }
    }
  );
});
