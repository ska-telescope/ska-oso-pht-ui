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
  verifySubmissionCreatedAlertFooter,
  verifyScienceIdeaCreatedAlertFooter, selectObservingMode
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

beforeEach(() => {
  initialize(standardUser);
  mockCreateSubmissionAPI();
  mockEmailAPI();
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

  it('SV Flow: Edit a basic proposal', { jiraKey: 'XTP-71405' }, () => {
    createScienceIdeaLoggedIn();
    cy.wait('@mockCreateSubmission');
    verifyScienceIdeaCreatedAlertFooter();
    pageConfirmed('TEAM');

    //edit existing proposal
    clickHome();
    verifyOnLandingPage();
    verifyOnLandingPageFilterIsVisible();
    verifyMockedProposalOnLandingPageIsVisible();
    //TODO: Resolve edit selector which fails in the pipeline
    clickEdit();
    pageConfirmed('TITLE');

    //complete mandatory fields
    clickStatusIconNav('statusId1'); //Click to team page
    pageConfirmed('TEAM');

    addInvestigator();
    cy.wait('@mockInviteUserByEmail');
    verifyEmailSentAlertFooter();
    clickStatusIconNav('statusId2'); //Click to details page
    pageConfirmed('DETAILS');

    //TODO: Resolve selector
    selectObservingMode('continuum');
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
