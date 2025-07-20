import { createObservation, createStandardProposal, initialize } from '../common/common';
beforeEach(() => {
  initialize();
  createStandardProposal();
});

describe('Creating Observation', () => {
  it('Create a default observation', { jiraKey: 'XTP-71406' }, () => {
    createObservation();
  });
});
