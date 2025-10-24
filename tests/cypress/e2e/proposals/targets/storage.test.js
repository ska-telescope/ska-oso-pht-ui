describe('updateAppContent2 Functionality', () => {
  it('should update the proposal with the new target', () => {
    // Mock the updateAppContent2 function
    const updateAppContent2 = cy.stub();

    // Mock the getProposal function to return a sample proposal
    const getProposal = () => ({
      targets: [
        { id: 1, name: 'Target1' },
        { id: 2, name: 'Target2' }
      ]
    });

    // Define the setProposal function
    const setProposal = proposal => updateAppContent2(proposal);

    // Define the new target to be added
    const newTarget = { check: 3, name: 'Target3' };

    // Create the updated proposal
    const updatedProposal = {
      ...getProposal(),
      targets: [...(getProposal().targets ?? []), newTarget]
    };

    // Call setProposal with the updated proposal
    setProposal(updatedProposal);

    // Assert that updateAppContent2 was called once
    expect(updateAppContent2).to.have.been.calledOnce;

    // Assert that updateAppContent2 was called with the correct updated proposal
    expect(updateAppContent2).to.have.been.calledWith({
      targets: [
        { id: 1, name: 'Target1' },
        { id: 2, name: 'Target2' },
        { id: 3, name: 'Target3' }
      ]
    });
  });
});
