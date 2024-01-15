/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import {BrowserRouter} from "react-router-dom";
import theme from '../../../services/theme/theme';
import ObservationContent from './ObservationContent';

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<ObservationContent />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
        cy.mount(
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <BrowserRouter>
              <ObservationContent />
            </BrowserRouter>
          </ThemeProvider>
        );
        cy.get('[dataid=1]').should('have.text', 'MID')
        cy.get('h6').contains('Target List related to the selected Observation')
    });
  }
});
