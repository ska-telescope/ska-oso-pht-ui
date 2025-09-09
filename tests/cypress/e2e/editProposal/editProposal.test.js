import {
  addAbstract,
  addM2TargetUsingResolve,
  addObservatoryDataProduct,
  addInvestigator,
  clickAddDataProduct,
  clickEditProposal,
  clickHome,
  clickObservationSetup,
  clickAddObservationEntry,
  verifySensitivityCalculatorStatusSuccess,
  clickSave,
  clickToAddTarget,
  clickToGeneralPage,
  clickToObservationPage,
  clickObservationFromTable,
  clickToLinkTargetAndObservation,
  clickToObservatoryDataProductPage,
  clickToSciencePage,
  clickToTargetPage,
  clickToTeamPage,
  clickToTechnicalPage,
  createStandardProposal,
  pageConfirmed,
  selectCosmology,
  validateProposal,
  verifyEmailSentAlertFooter,
  verifyObservationInTable,
  verifyOnLandingPage,
  verifyOnLandingPageFilterIsVisible,
  verifyHomeButtonWarningModal,
  clickHomeWarningConfirmation,
  mockCreateProposalAPI,
  createStandardProposalLoggedIn,
  verifyMockedProposalOnLandingPageIsVisible,
  verifyProposalCreatedAlertFooter,
  mockEmailAPI,
  clickLoginUser,
  initialize,
  clearLocalStorage
} from '../common/common';
import { defaultUser } from '../users/users.js';

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

describe('Edit Proposal', () => {
  it('Edit a basic proposal', { jiraKey: 'XTP-71405' }, () => {
    cy.wait('@mockCreateProposal');
    verifyProposalCreatedAlertFooter();
    pageConfirmed('TEAM');
    //edit existing proposal
    clickHome();
    verifyOnLandingPage();
    verifyOnLandingPageFilterIsVisible();
    verifyMockedProposalOnLandingPageIsVisible();
    //TODO: Mock proposal access, then reinstate steps below
    // clickEditProposal();
    // pageConfirmed('TITLE');
    // //complete mandatory fields
    // clickToTeamPage();
    // addInvestigator();
    // cy.wait('@mockInviteUserByEmail');
    // verifyEmailSentAlertFooter();
    //TODO: Mock add team member functionality, then reinstate steps below
    // clickToGeneralPage();
    // addAbstract();
    // selectCosmology();
    // clickToSciencePage();
    // clickToTargetPage();
    // addM2TargetUsingResolve();
    // clickToAddTarget();
    // clickToObservationPage();
    // clickObservationSetup();
    // clickAddObservationEntry();
    // verifyObservationInTable();
    // clickObservationFromTable();
    // clickToLinkTargetAndObservation();
    // verifySensitivityCalculatorStatusSuccess();
    // clickSave();
    // clickToTechnicalPage();
    // clickToObservatoryDataProductPage();
    // clickAddDataProduct();
    // addObservatoryDataProduct();
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
});
