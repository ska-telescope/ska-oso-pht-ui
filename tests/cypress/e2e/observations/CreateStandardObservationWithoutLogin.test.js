import {
  createObservation,
  clickMockLoginButton,
  createStandardProposal,
  initialize
} from '../common/common';

beforeEach(() => {
  initialize();
  clickMockLoginButton();
  createStandardProposal();
});

describe('Creating Observation', () => {
  it('Create a default observation', () => {
    createObservation();
  });
});
