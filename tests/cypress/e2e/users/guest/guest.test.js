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

  it('Access proposal screens without login', () => {
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
    checkFieldDisabled('statusId6', true);
    // checkFieldDisabled('statusId7', true);
    checkFieldDisabled('statusId8', true);

    clickHome();
    verifyHomeButtonWarningModal();
    clickDialogConfirm();
    verifyOnLandingPageNotLoggedInMsgIsVisible();
  });
});
