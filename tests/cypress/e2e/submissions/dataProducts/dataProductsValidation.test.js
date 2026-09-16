import {
  clearLocalStorage,
  clickStatusIconNav,
  pageConfirmed,
  updateDataProductField,
  verifyFieldError,
  addM2TargetAndAutoLink,
  mockResolveTargetAPI,
  mockEmailAPI,
  createScienceIdeaSession
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';
beforeEach(() => {
  mockEmailAPI();
  mockResolveTargetAPI();
});

afterEach(() => {
  clearLocalStorage();
});

describe('Data product validation', () => {
  it('SV Flow: Verify channels out range', () => {
    createScienceIdeaSession(standardUser);
    addM2TargetAndAutoLink('Continuum', 'This is a summary of the science idea.');

    clickStatusIconNav('statusId7'); //Click to data product page
    pageConfirmed('DATA PRODUCT');

    updateDataProductField('channelsOut', '41'); //enter invalid channels out
    verifyFieldError('channelsOut', 'Valid range is 1 - 40', true); //verify field error
  });
});
