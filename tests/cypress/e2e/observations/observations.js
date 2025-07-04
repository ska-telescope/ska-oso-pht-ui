export const verifyContinuumSpectralAverageRangeAA4 = value => {
  enterSpectralAverageValue(0);
  verifySpectralAverageRangeError();
  enterSpectralAverageValue(27625);
  verifySpectralAverageRangeError();
};

export const verifyContinuumSpectralAverageRangeAA2 = value => {
  selectSubArrayAA2();
  enterSpectralAverageValue(0);
  verifySpectralAverageRangeError();
  enterSpectralAverageValue(13813);
  verifySpectralAverageRangeError();
};

export const verifyContinuumSpectralAverageRangeAA1 = value => {
  selectSubArrayAA1();
  enterSpectralAverageValue(0);
  verifySpectralAverageRangeError();
  enterSpectralAverageValue(6907);
  verifySpectralAverageRangeError();
};

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

const selectSubArrayAA2 = value => {
  cy.get('[data-testid="subArrayConfiguration"]').click();
  cy.get('[data-value="3"]').click({ force: true });
};

const selectSubArrayAA2Core = value => {
  cy.get('[data-testid="subArrayConfiguration"]').click();
  cy.get('[data-value="4"]').click({ force: true });
};

const selectSubArrayAA1 = value => {
  cy.get('[data-testid="subArrayConfiguration"]').click();
  cy.get('[data-value="2"]').click({ force: true });
};

const selectSubArrayCustom = value => {
  cy.get('[data-testid="subArrayConfiguration"]').click();
  cy.get('[data-value="20"]').click({ force: true });
};

const selectObservationTypeZoom = value => {
  cy.get('[data-testid="observationType"]').click();
  cy.get('[data-value="0"]').click({ force: true });
};

const verifySpectralAverageRangeError = () => {
  cy.get('[id="spectralAveraging-helper-text"]').should(
    'contain',
    'Value is outside of allowed range'
  );
};
