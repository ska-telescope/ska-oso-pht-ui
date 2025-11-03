import {
  clickHome,
  pageConfirmed,
  verifyOnLandingPage,
  verifyOnLandingPageFilterIsVisible,
  mockCreateProposalAPI,
  verifyMockedProposalOnLandingPageIsVisible,
  verifyProposalCreatedAlertFooter,
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
  verifySensitivityCalculatorStatusSuccess
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

beforeEach(() => {
  initialize(standardUser);
  mockCreateProposalAPI();
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
    cy.wait('@mockCreateProposal');
    verifyProposalCreatedAlertFooter();
    pageConfirmed('TEAM');

    //edit existing proposal
    clickHome();
    verifyOnLandingPage();
    verifyOnLandingPageFilterIsVisible();
    verifyMockedProposalOnLandingPageIsVisible();
    clickEdit();
    pageConfirmed('TITLE');

    //complete mandatory fields
    //TODO: FIX
    clickStatusIconNav('statusId1'); //Click to team page
    pageConfirmed('TEAM');

    addInvestigator();
    cy.wait('@mockInviteUserByEmail');
    verifyEmailSentAlertFooter();
    clickStatusIconNav('statusId2'); //Click to general page
    //TODO: Resolve selector
    // selectObservingMode('101');
    addAbstract();
    clickStatusIconNav('statusId5'); //Click to observation page
    clickObservationSetup();
    clickAddObservationEntry();
    verifyObservationInTable();
    clickObservationFromTable();
    clickToLinkTargetAndObservation();
    //TODO: Resolve Sensitivity calculator result
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

  //TODO: Implement full scenario to point of submission
});
