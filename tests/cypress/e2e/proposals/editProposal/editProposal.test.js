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
  addAbstract,
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
  verifySubmissionCreatedAlertFooter
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

beforeEach(() => {
  initialize(standardUser);
  mockCreateSubmissionAPI();
  mockEmailAPI();
  createScienceIdeaLoggedIn();
});

afterEach(() => {
  clearLocalStorage();
});

describe('Edit Proposal', () => {
  before(() => {
    cy.window().then(win => {
      win.localStorage.setItem('cypress:proposalEdit', 'true');
    });
  });

  it('Edit a basic proposal', { jiraKey: 'XTP-71405' }, () => {
    cy.wait('@mockCreateSubmission');
    verifySubmissionCreatedAlertFooter();
    pageConfirmed('TEAM');

    //edit existing proposal
    clickHome();
    verifyOnLandingPage();
    verifyOnLandingPageFilterIsVisible();
    verifyMockedProposalOnLandingPageIsVisible();
    //TODO: Resolve edit selector which fails in the pipeline
    // clickEdit();
    // pageConfirmed('TITLE');

    //complete mandatory fields
    //TODO: FIX
    // clickStatusIconNav('statusId1'); //Click to team page
    // pageConfirmed('TEAM');

    // addInvestigator();
    // cy.wait('@mockInviteUserByEmail');
    // verifyEmailSentAlertFooter();
    // clickStatusIconNav('statusId2'); //Click to general page
    //TODO: Resolve selector
    // selectObservingMode('101');
    // addAbstract();
    // clickStatusIconNav('statusId5'); //Click to observation page
    // clickObservationSetup();
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
