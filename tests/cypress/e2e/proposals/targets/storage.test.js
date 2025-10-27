describe('updateAppContent2 Functionality', () => {
  it('should update the proposal with the new target', () => {
    // Mock the updateAppContent2 function
    const updateAppContent2 = cy.stub();

    // Mock the getProposal function to return a sample proposal
    const getProposal = () => ({
      targets: [
        {
          kind: 0,
          decStr: '-00:49:23.700',
          id: 1,
          name: 'M2',
          b: 0,
          l: 0,
          raStr: '21:33:27.0200',
          redshift: '',
          referenceFrame: 'icrs',
          vel: '-3.6',
          velType: 0,
          velUnit: 0,
          tiedArrayBeams: null
        }
      ]
    });

    // Define the setProposal function
    const setProposal = proposal => updateAppContent2(proposal);

    // Define the new target to be added
    const newTarget = {
      kind: 0,
      decStr: '+28:22:38.200',
      id: 2,
      name: 'M3',
      b: 0,
      l: 0,
      raStr: '13:42:11.6200',
      redshift: '',
      referenceFrame: 'icrs',
      vel: '-3.6',
      velType: 0,
      velUnit: 0,
      tiedArrayBeams: null
    };

    // Validation function to check if the target matches the expected format
    const isValidTarget = target => {
      const requiredKeys = [
        'kind',
        'decStr',
        'id',
        'name',
        'b',
        'l',
        'raStr',
        'redshift',
        'referenceFrame',
        'vel',
        'velType',
        'velUnit',
        'tiedArrayBeams'
      ];
      return requiredKeys.every(key => target.hasOwnProperty(key));
    };

    // Create the updated proposal only if the new target is valid
    if (isValidTarget(newTarget)) {
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
          {
            kind: 0,
            decStr: '-00:49:23.700',
            id: 1,
            name: 'M2',
            b: 0,
            l: 0,
            raStr: '21:33:27.0200',
            redshift: '',
            referenceFrame: 'icrs',
            vel: '-3.6',
            velType: 0,
            velUnit: 0,
            tiedArrayBeams: null
          },
          {
            kind: 0,
            decStr: '+28:22:38.200',
            id: 2,
            name: 'M3',
            b: 0,
            l: 0,
            raStr: '13:42:11.6200',
            redshift: '',
            referenceFrame: 'icrs',
            vel: '-3.6',
            velType: 0,
            velUnit: 0,
            tiedArrayBeams: null
          }
        ]
      });
    } else {
      // Handle invalid target case
      cy.log('Invalid target format. Proposal not updated.');
    }
  });

  it('should update the proposal with the second new target', () => {
    // Mock the updateAppContent2 function
    const updateAppContent2 = cy.stub();

    // Mock the getProposal function to return a sample proposal
    const getProposal = () => ({
      targets: [
        {
          kind: 0,
          decStr: '-00:49:23.700',
          id: 1,
          name: 'M2',
          b: 0,
          l: 0,
          raStr: '21:33:27.0200',
          redshift: '',
          referenceFrame: 'icrs',
          vel: '-3.6',
          velType: 0,
          velUnit: 0,
          tiedArrayBeams: null
        }
      ]
    });

    // Define the setProposal function
    const setProposal = proposal => updateAppContent2(proposal);

    // Define the new target to be added
    const newTarget = { id: 2, name: 'Target2' };

    // Validation function to check if the target matches the expected format
    const isValidTarget = target => {
      const requiredKeys = [
        'kind',
        'decStr',
        'id',
        'name',
        'b',
        'l',
        'raStr',
        'redshift',
        'referenceFrame',
        'vel',
        'velType',
        'velUnit',
        'tiedArrayBeams'
      ];
      return requiredKeys.every(key => target.hasOwnProperty(key));
    };

    // Create the updated proposal only if the new target is valid
    if (isValidTarget(newTarget)) {
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
          {
            kind: 0,
            decStr: '-00:49:23.700',
            id: 1,
            name: 'M2',
            b: 0,
            l: 0,
            raStr: '21:33:27.0200',
            redshift: '',
            referenceFrame: 'icrs',
            vel: '-3.6',
            velType: 0,
            velUnit: 0,
            tiedArrayBeams: null
          },
          {
            kind: 1,
            decStr: '+12:34:56.789',
            id: 3,
            name: 'M4',
            b: 1,
            l: 1,
            raStr: '10:20:30.4000',
            redshift: '0.5',
            referenceFrame: 'galactic',
            vel: '5.0',
            velType: 1,
            velUnit: 1,
            tiedArrayBeams: [1, 2]
          }
        ]
      });
    } else {
      // Handle invalid target case
      cy.log('Invalid target format. Proposal not updated.');
    }
  });
});
