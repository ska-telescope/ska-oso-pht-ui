import {
  checkFieldDisabled,
  clickHome,
  clickDialogConfirm,
  verifyHomeButtonWarningModal,
  initializeUserNotLoggedIn,
  clearLocalStorage,
  clickToNextPage,
  createObservation,
  addM2TargetUsingResolve,
  // clickListOfTargets,
  createMock,
  verify,
  verifyUnlinkedObservationInTable,
  verifyOnLandingPageNotLoggedInMsgIsVisible
} from '../../common/common';

describe('Guest User', () => {
  beforeEach(() => {
    initializeUserNotLoggedIn();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('Validate not signed in', () => {
    verify('loginButton');
  });

  // TODO Scenario needs to be re-defined based on a non-logged in user flow - see STAR-1904
  it.skip('Access proposal screens without login', () => {
    createMock();

    //add target
    // clickListOfTargets();
    addM2TargetUsingResolve();

    //go to observation page
    clickToNextPage();

    //add observation
    createObservation();
    verifyUnlinkedObservationInTable();

    checkFieldDisabled('saveBtn', true);
    checkFieldDisabled('validateBtn', true);

    //verify statusIcons disabled excluding target & observation
    checkFieldDisabled('statusId0', true);
    checkFieldDisabled('statusId1', true);
    checkFieldDisabled('statusId2', true);
    checkFieldDisabled('statusId3', true);
    checkFieldDisabled('statusId4', false);
    checkFieldDisabled('statusId5', false);
    // checkFieldDisabled('statusId6', true); - TODO Check when not SV
    checkFieldDisabled('statusId7', true);
    // checkFieldDisabled('statusId8', true); - TODO Check when not SV

    clickHome();
    verifyHomeButtonWarningModal();
    clickDialogConfirm();
    verifyOnLandingPageNotLoggedInMsgIsVisible();
  });
});
