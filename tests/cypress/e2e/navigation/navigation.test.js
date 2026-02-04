import {
  initialize,
  clearLocalStorage,
  clickCycleConfirm,
  enterScienceVerificationIdeaTitle,
  clickAddSubmission,
  clickCreateSubmission,
  mockCreateSubmissionAPI,
  verifySubmissionCreatedAlertFooter,
  clickCycleSelectionSV,
  checkStatusIndicatorDisabled,
  verifyScienceIdeaCreatedAlertFooter
} from '../common/common.js';
import { standardUser } from '../users/users.js';

describe('Verify navigation', () => {
  beforeEach(() => {
    initialize(standardUser);
    mockCreateSubmissionAPI();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('Science verification: Verify navigation functionality is not restricted after science idea creation', () => {
    clickAddSubmission();
    clickCycleSelectionSV();
    clickCycleConfirm();
    enterScienceVerificationIdeaTitle();
    clickCreateSubmission();
    cy.wait('@mockCreateSubmission');
    verifyScienceIdeaCreatedAlertFooter();
    //Verify navigation links are all enabled in page banner after proposal creation
    checkStatusIndicatorDisabled('statusId0', false);
    checkStatusIndicatorDisabled('statusId1', false);
    checkStatusIndicatorDisabled('statusId2', false);
    checkStatusIndicatorDisabled('statusId3', false);
    checkStatusIndicatorDisabled('statusId4', false);
    checkStatusIndicatorDisabled('statusId5', false);
    // statusId6 unavailable for science verification
    checkStatusIndicatorDisabled('statusId7', false);
    // statusId8 unavailable for science verification
    checkStatusIndicatorDisabled('statusId9', false);
    // See SRCNet INACTIVE - checkStatusIndicatorDisabled('statusId10', false);
  });
});
