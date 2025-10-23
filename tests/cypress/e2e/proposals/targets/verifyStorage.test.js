import {
  addM2TargetUsingResolve,
  clickToAddTarget,
  createMock,
  initializeUserNotLoggedIn,
  mockResolveTargetAPI
} from '../../common/common.js';

describe('Verify data in storage', () => {
  beforeEach(() => {
    initializeUserNotLoggedIn();
    createMock();
    mockResolveTargetAPI();
  });

  it('should call updateAppContent2 with updated proposal data', () => {
    // Mock the storageObject.useStore
    cy.window().then(win => {
      const mockUpdateAppContent2 = cy.spy().as('updateAppContent2Spy');
      win.storageObject = {
        useStore: () => ({
          application: { content2: { targets: [] } },
          updateAppContent2: mockUpdateAppContent2
        })
      };
    });

    // add target to trigger updateAppContent2
    addM2TargetUsingResolve();
    cy.wait('@mockResolveTarget');
    clickToAddTarget();

    // Assert that updateAppContent2 was called with the correct data
    cy.get('@updateAppContent2Spy').should('have.been.calledOnce');
    cy.get('@updateAppContent2Spy').should('have.been.calledWith', {
      targets: [{ name: 'New Target', id: '1' }] // Replace with expected data
    });
  });
});
