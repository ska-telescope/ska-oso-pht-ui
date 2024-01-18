/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import ObservationContent from './ObservationContent';
import MockProposal from "../../../services/axios/getProposal/mockProposal";
import {DEFAULT_HELP} from "../../../utils/constants";
import {BrowserRouter} from "react-router-dom";

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<ObservationContent />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <ThemeProvider theme={theme(theTheme)}>
          <CssBaseline />
            <BrowserRouter>
                <ObservationContent
                    page={5}
                    proposal={MockProposal}
                    setHelp={cy.stub().as('setHelp')}
                    setProposal={cy.stub().as('setProposal')}
                    setStatus={cy.stub().as('setTheProposalState')}
                    help={DEFAULT_HELP}
                />
            </BrowserRouter>
        </ThemeProvider>
      );
    });
  }
    it(`Renders`, () => {
        cy.mount(
            <BrowserRouter>
                <ObservationContent
                    page={5}
                    proposal={MockProposal}
                    setHelp={cy.stub().as('setHelp')}
                    setProposal={cy.stub().as('setProposal')}
                    setStatus={cy.stub().as('setTheProposalState')}
                    help={DEFAULT_HELP}
                />
            </BrowserRouter>
        );
        cy.get('[data-testid="Add observationButton"]').click();
    });
});
