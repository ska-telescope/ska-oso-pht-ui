import {
  clickHome,
  pageConfirmed,
  verifyOnLandingPage,
  verifyOnLandingPageFilterIsVisible,
  verifyMockedProposalOnLandingPageIsVisible,
  mockEmailAPI,
  initialize,
  clearLocalStorage,
  createScienceIdeaLoggedIn,
  clickEdit,
  clickStatusIconNav,
  addInvestigator,
  verifyEmailSentAlertFooter,
  clickToAddTarget,
  addM2TargetUsingResolve,
  clickObservationSetup,
  clickAddObservationEntry,
  verifyObservationInTable,
  clickObservationFromTable,
  clickToLinkTargetAndObservation,
  verifySensitivityCalculatorStatusSuccess,
  clickToCalibrationPage,
  mockCreateSubmissionAPI,
  verifySubmissionCreatedAlertFooter,
  verifyScienceIdeaCreatedAlertFooter,
  selectObservingMode,
  verifyAutoLinkAlertFooter,
  mockResolveTargetAPI,
  createStandardProposalLoggedIn,
  addSubmissionSummary,
  clickEditIconForRow,
  verifyMockedScienceIdeaOnLandingPageIsVisible
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

beforeEach(() => {
  initialize(standardUser);
  mockCreateSubmissionAPI();
  mockEmailAPI();
  mockResolveTargetAPI();
});

afterEach(() => {
  clearLocalStorage();
});

describe('Edit Proposal', () => {
  before(() => {
    cy.window().then(win => {
      win.localStorage.setItem('cypress:proposalEdit', 'true');
      win.localStorage.setItem('cypress:scienceVerificationIdea', 'true');
    });
  });

  it('SV Flow: Edit a basic science idea', () => {
    createScienceIdeaLoggedIn();
    cy.wait('@mockCreateSubmission');
    verifyScienceIdeaCreatedAlertFooter();
    pageConfirmed('TEAM');

    //edit existing science verification idea
    clickHome();
    verifyOnLandingPage();
    verifyOnLandingPageFilterIsVisible();
    verifyMockedScienceIdeaOnLandingPageIsVisible();
    clickEditIconForRow('review-table', 'Science Verification');
    pageConfirmed('TITLE');
    //complete mandatory fields
    clickStatusIconNav('statusId2'); //Click to details page
    pageConfirmed('DETAILS');
    selectObservingMode('Continuum');
    addSubmissionSummary('This is a summary of the science idea.');
  });

  it.skip('Proposal Flow: Edit a basic proposal', { jiraKey: 'XTP-71405' }, () => {
    createStandardProposalLoggedIn();
    cy.wait('@mockCreateSubmission');
    verifySubmissionCreatedAlertFooter();
    pageConfirmed('TEAM');

    //edit existing proposal
    clickHome();
    verifyOnLandingPage();
    verifyOnLandingPageFilterIsVisible();
    verifyMockedProposalOnLandingPageIsVisible();
    clickEditIconForRow('review-table', 'Proposal Title');
    pageConfirmed('TITLE');

    // //complete mandatory fields
    // clickStatusIconNav('statusId1'); //Click to team page
    // pageConfirmed('TEAM');
    //
    // addInvestigator();
    // cy.wait('@mockInviteUserByEmail');
    // verifyEmailSentAlertFooter();
    // clickStatusIconNav('statusId2'); //Click to details page
    // pageConfirmed('DETAILS');
    // selectObservingMode('Continuum');
    // addSubmissionSummary('This is a summary of the proposal.');
    // clickAddObservationEntry();
    // verifyObservationInTable();
    // clickObservationFromTable();
    // clickToLinkTargetAndObservation();
    //TODO: Resolve Sensitivity calculator result
    // verifySensitivityCalculatorStatusSuccess();
    // clickSave();
    // clickToTechnicalPage();
    // clickToObservatoryDataProductPage();
    // clickAddDataProduct();
    // addObservatoryDataProduct();
    // clickToCalibrationPage();
    // //validate proposal
    // validateProposal();
    // //TODO: The remainder of this scenario can be reinstated upon completion of STAR-954
    // // verifyProposalIsValid()
    // //submit proposal
    // // clickToSubmitProposal();
    // // clickToConfirmProposalSubmission();
    // // //verify status of submitted proposal
    // // verifyFirstProposalOnLandingPageHasSubmittedStatus();
  });

  //TODO: Implement full scenario to point of submission
});
