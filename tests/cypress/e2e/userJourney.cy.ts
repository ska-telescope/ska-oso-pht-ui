context('PROPOSAL HANDLING TOOL', () => {
  beforeEach(() => {
    cy.visit('http://localhost:6100/');
  });

  it('Header : Verify external link to skao site', () => {
    cy.get('[data-testid="skaoLogo"]').click();
  });

  it('Header : Verify light/dark mode is available', () => {
    cy.get('[data-testid="Brightness7Icon"]').click();
    cy.get('[data-testid="Brightness4Icon"]').should('be.visible');
    cy.get('[data-testid="Brightness4Icon"]').click();
    cy.get('[data-testid="Brightness7Icon"]').should('be.visible');
  });

  it('Footer : Verify Version', () => {
    cy.get('[data-testid="footerId"]')
      .contains('0.1.0')
      .should('be.visible');
  });

  it('Content : Create proposal, complete all sections as required and then submit', () => {
    cy.get('[data-testid="Add proposalButton"]').click();
    //Complete title page
    cy.get('[data-testid="titleId"]').type('Test Proposal');
    cy.get('[id="ProposalType-1"]').click({ force: true });
    cy.get('[aria-label="A target of opportunity observing proposal"]').click();
    cy.get('[data-testid="CreateButton"]').click();
    //Complete team page
    cy.get('[data-testid="ArrowForwardIosIcon"]').click();
    cy.get('[data-testid="firstName"]').type('User');
    cy.get('[data-testid="lastName"]').type('Name');
    cy.get('[data-testid="email"]').type('username@test.com');
    cy.get('[data-testid="Send invitationButton"]').click({ force: true });
    cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
      .children('div[role="row"]')
      .should('contain', 'User')
      .should('contain', 'Name')
      .should('contain', 'Pending')
      .should('contain', 'No')
      .should('have.length', 1);
    //Complete general page
    cy.get('[data-testid="ArrowForwardIosIcon"]').click();
    cy.get('[data-testid="abstractId"]').type('Test Abstract');
    cy.get('[id="dropDownId"]').click({ force: true });
    cy.get('[data-value="1"]').click({ force: true });
    cy.get('[id="dropDownId"]').should('contain', 'Cosmology');
    //Complete science page
    cy.get('[data-testid="ArrowForwardIosIcon"]').click();
    //IMPLEMENT FILE UPLOAD
    //Complete target page
    cy.get('[data-testid="ArrowForwardIosIcon"]').click();
    //manual input of target co-ordinates
    cy.get('[data-testid="name"]').type('M1');
    cy.get('[data-testid="ra"]').type('0:0:0');
    cy.get('[data-testid="dec"]').type('0:0:0');
    cy.get('[data-testid="vel"]').type('1');
    cy.get('[data-testid="Add targetButton"]').click({ force: true });
    //Complete observation page
    cy.get('[data-testid="ArrowForwardIosIcon"]').click();
    cy.get('[data-testid="observation setupButton"]').click();
    //verify telescope of type MID and observation type Continuum
    cy.get('[id="dropDownTelescopeId"]').should('contain', 'MID');
    cy.get('[id="dropDownArray ConfigurationId"]').should('contain', 'AA0.5');
    cy.get('[id="dropDownObserving BandId"]').should('contain', 'Band 1 (0.35 - 1.05 GHz)');
    cy.get('[data-testid="elevation"]').type('1');
    cy.get('[data-testid="weather"]').type('Cold');
    cy.get('[id="dropDownObservation TypeId"]').should('contain', 'Continuum');
    cy.get('[data-testid="suppliedType"]').should('contain', 'Integration Time');
    cy.get('[data-testid="suppliedValue"]').type('1');
    cy.get('[data-testid="suppliedUnits"]').should('contain', 'd');
    cy.get('[data-testid="centralFrequency"]').type('1');
    cy.get('[data-testid="frequencyUnits"]').should('contain', 'GHz');
    cy.get('[data-testid="continuumBandwidth"]').type('1');
    cy.get('[data-testid="continuumUnits"]').should('contain', 'GHz');
    cy.get('[id="dropDownBandwidthId"]').should('contain', '3.125 MHz');
    cy.get('[id="dropDownSpectral ResolutionId"]').should('contain', '0.21 KHz');
    cy.get('[id="dropDownSpectral AveragingId"]').should('contain', '1');
    cy.get('[data-testid="effective"]').type('1');
    cy.get('[id="dropDownTaperingId"]').should('contain', 'No tapering');
    // cy.get('[aria-label="EntryField"]').should('contain', '0');
    cy.get('[id="dropDownImage WeightingId"]').should('contain', 'Uniform');
    cy.get('[data-testid="addButton"]').click();
    cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
      .children('div[role="row"]')
      .should('contain', 'MID')
      .should('contain', 'AA0.5')
      .should('contain', 'Zoom')
      .should('contain', 'M1')
      .should('contain', '0:0:0')
      .should('contain', '0:0:0');
    //Complete technical page
    cy.get('[data-testid="ArrowForwardIosIcon"]').click();
    //IMPLEMENT FILE UPLOAD
    //Complete data page
    cy.get('[data-testid="ArrowForwardIosIcon"]').click();
    cy.get('[data-testid="pipelineId"]').type('test');
    //Complete src net page
    cy.get('[data-testid="ArrowForwardIosIcon"]').click();
    cy.get('[data-testid="pipelineId"]').type('test');
    //validate proposal
    cy.get('[data-testid="ValidateButton"]').click();
  });

  it('Content : Begin to create proposal but leave the title page incomplete, create button should remain disabled', () => {
    cy.get('[data-testid="Add proposalButton"]').click();
    //Partially complete title page
    cy.get('[id="ProposalType-1"]').click({ force: true });
    cy.get('[aria-label="A target of opportunity observing proposal"]').click();
    cy.get('[data-testid="CreateButton"]').should('not.be.selected');
  });
});
