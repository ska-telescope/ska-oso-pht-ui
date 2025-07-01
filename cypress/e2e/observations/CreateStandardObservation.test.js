import {
  clickAddObservation,
  clickObservationSetup,
  clickToGeneralPage,
  clickToObservationPage,
  clickToSciencePage,
  clickToTargetPage,
  createStandardProposal,
  initialize
} from '../common/common';
beforeEach(() => {
  initialize();
  createStandardProposal();
});

const verifyUnlinkedObservationInTable = () => {
  cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
    .children('div[role="row"]')
    .should('contain', 'obs-')
    .should('contain', 'AA4')
    .should('have.length', 1);
};

describe('XTP-84025 Create Observation', () => {
  it('Create a default observation', () => {
    //navigate to observation page
    clickToGeneralPage();
    clickToSciencePage();
    clickToTargetPage();
    clickToObservationPage();
    //add default observation
    clickObservationSetup();
    clickAddObservation();
    verifyUnlinkedObservationInTable();
  });
});
