export const verifyContinuumSpectralAverageRange = value => {
  enterSpectralAverageValue(0);
  verifySpectralAverageRangeError();
  enterSpectralAverageValue(value);
  verifySpectralAverageRangeError();
};

export const verifyContinuumSpectralAverageRangeAA4 = value =>
  verifyContinuumSpectralAverageRange(27625);
export const verifyContinuumSpectralAverageRangeAA2 = value => {}; // TODO MUI UPDATE - verifyContinuumSpectralAverageRange(13813);
export const verifyContinuumSpectralAverageRangeAA1 = value => {}; // TODO MUI UPDATE - verifyContinuumSpectralAverageRange(6907);

export const verifyZoomSpectralAverageRangeAA2Core = value => {
  selectSubArrayAA2Core();
  selectObservationTypeZoom();
  enterSpectralAverageValue(0);
  verifySpectralAverageRangeError();
  enterSpectralAverageValue(865);
  verifySpectralAverageRangeError();
};

export const verifyZoomSpectralAverageRangeCustom = value => {
  selectSubArrayCustom();
  enterSpectralAverageValue(0);
  verifySpectralAverageRangeError();
  enterSpectralAverageValue(865);
  verifySpectralAverageRangeError();
};

const enterSpectralAverageValue = value => {
  cy.get('[data-testid="spectralAveraging"]').type('{selectall}{del}');
  cy.get('[data-testid="spectralAveraging"]').type(value);
};

const selectDropDown = (testId, value) => {
  cy.get('[data-testid="' + testId + '"]')
    .should('exist')
    .should('be.visible')
    .realClick();
  cy.get('[data-value="' + value + '"]', { timeout: 10000 }) // wait for it to appear
    .should('exist')
    .should('be.visible')
    .realClick();
  // cy.get('body').click(0, 0);
};

const selectSubArrayAA1 = () => selectDropDown('subArrayConfiguration', 2);
const selectSubArrayAA2 = () => selectDropDown('subArrayConfiguration', 3);
const selectSubArrayAA2Core = () => selectDropDown('subArrayConfiguration', 4);
const selectSubArrayCustom = () => selectDropDown('subArrayConfiguration', 20);

const selectObservationTypeZoom = (testId = 'observationType', value = 0) => {
  cy.get('[data-testid="' + testId + '"]')
    .should('exist')
    .should('be.visible')
    .realClick();
  cy.get('[data-value="' + value + '"]', { timeout: 10000 })
    .should('exist')
    .should('be.visible')
    .realClick();
};

const verifySpectralAverageRangeError = () => {
  cy.get('[id="spectralAveraging-helper-text"]').should(
    'contain',
    'Value is outside of allowed range'
  );
};
