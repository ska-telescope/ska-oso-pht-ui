import {
  clearLocalStorage,
  checkFieldDisabled,
  checkFieldIsVisible,
  beginScienceIdeaSession,
  selectScienceVerificationCycle,
  completeScienceIdeaCreation,
  beginStandardProposalSession,
  selectStandardProposalCycle,
  completeStandardProposalCreation
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

describe('Verify Save', () => {
  afterEach(() => {
    clearLocalStorage();
  });

  it('SV Flow: Verify save becomes available only after SV idea creation', () => {
    beginScienceIdeaSession(standardUser);
    selectScienceVerificationCycle();
    //Verify save is not visible before sv creation
    checkFieldIsVisible('saveBtn', false);
    completeScienceIdeaCreation();
    //Verify save is enabled after sv creation
    checkFieldDisabled('saveBtn', false);
  });

  it('Proposal Flow: Verify save becomes available only after proposal creation', () => {
    beginStandardProposalSession(standardUser);
    selectStandardProposalCycle();
    //Verify save is not visible before proposal creation
    checkFieldIsVisible('saveBtn', false);
    completeStandardProposalCreation();
    //Verify save is enabled after proposal creation
    checkFieldDisabled('saveBtn', false);
  });
});
