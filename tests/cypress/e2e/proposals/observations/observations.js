export const verifySpectralAverageRange = value => {
  enterSpectralAverageValue(0);
  verifySpectralAverageRangeError();
  enterSpectralAverageValue(value);
  verifySpectralAverageRangeError();
};

export const verifyContinuumSpectralAverageRangeAA2 = value => verifySpectralAverageRange(13813);

export const verifyZoomSpectralAverageRangeAA2 = value => {
  verifySpectralAverageRange(865);
};
export const verifyZoomSpectralAverageRangeCustom = value => {
  verifySpectralAverageRange(865);
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

export const selectSubArrayAA1 = () => selectDropDown('subArrayConfiguration', 2);
export const selectSubArrayAA2 = () => selectDropDown('subArrayConfiguration', 3);
export const selectSubArrayAA2Core = () => selectDropDown('subArrayConfiguration', 4);
export const selectSubArrayCustom = () => selectDropDown('subArrayConfiguration', 20);

export const selectObservationTypeZoom = (testId = 'observationType', value = 0) => {
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
