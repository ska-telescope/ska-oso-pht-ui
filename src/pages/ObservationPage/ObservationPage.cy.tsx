/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { BrowserRouter } from 'react-router-dom';
import theme from '../../services/theme/theme';
import ObservationPage from './ObservationPage';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<ObservationContent />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <StoreProvider>
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <BrowserRouter>
              <ObservationPage />
            </BrowserRouter>
          </ThemeProvider>
        </StoreProvider>
      );
    });
  }
  it(`Renders`, () => {
    cy.mount(
      <StoreProvider>
        <BrowserRouter>
          <ObservationPage />
        </BrowserRouter>
      </StoreProvider>
    );
    // TODO find a way to include redux store in tests so that the component can be mounted and tested
    /*
    Currently the observationPage is not mounted at all. This seems linked to an issue when accessing the Redux store in the component.
    When commenting line 133-138 and commenting all the html linked to accessing getProposal() or getRow()
    // React.useEffect(() => {
    // const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
    // let count = getRows().length > 0 ? 1 : 0;
    // count += getProposal().targetObservation.length > 0 ? 1 : 0;
    // setTheProposalState(result[count]);
    // }, [validateToggle]);
    Then div is rendered correctly in test. Otherwise the component is not mounted so it can not be tested.
    I have tried to look at https://www.cypress.io/blog/2018/11/14/testing-redux-store but this seems outdated.
    Sarah
    */

    /*
    cy.get('[data-testid="Add observationButton"]').click();
    cy.get('[data-testid="observationDetails"]').should('contain', 'Telescope');
    cy.get('[data-testid="observationDetails"]').should('contain', 'Subarray');
    cy.get('[data-testid="observationDetails"]').should('contain', 'Type');
    cy.get('[data-testid="observationDetails"]').should('contain', 'Actions');

    cy.get('[data-testid="observationDetails"]').should('contain', 'MID');
    cy.get('[data-testid="observationDetails"]').should('contain', 'subarray');
    cy.get('[data-testid="observationDetails"]').should('contain', 'Continuum');

    cy.get('[data-testid="linkedTargetDetails"]').should('contain', 'Name');
    cy.get('[data-testid="linkedTargetDetails"]').should('contain', 'Right Ascension');
    cy.get('[data-testid="linkedTargetDetails"]').should('contain', 'Declination');

    cy.get('[data-testid="linkedTargetDetails"]').should('contain', 'Target 3');
    cy.get('[data-testid="linkedTargetDetails"]').should('contain', '05:30:00');
    cy.get('[data-testid="linkedTargetDetails"]').should('contain', '-10:00:00');
    */
  });
});

// TODO: finish to implement test (request not happening)
// describe('GetCalculate good request', () => {
//   beforeEach(() => {
//     const queryString = new URLSearchParams(MockQueryMidCalculate).toString();
//     cy.intercept('GET', `${SKA_SENSITIVITY_CALCULATOR_API_URL}mid/calculate?${queryString}`, {
//       fixture: 'getMidCalculateResponse.json'
//     }).as('getCalculate');
//     cy.mount(
//       <StoreProvider>
//         <Router location="/" navigator={undefined}>
//           <ObservationPage />
//         </Router>
//       </StoreProvider>
//     );
//   });
//   it('displays "Success"', () => {
//     cy.wait('@getCalculate');
//     cy.get('[data-testid="alertSensCalErrorId"]')
//       .should('be.visible')
//       .should('have.text', 'Success');
//   });
// });
