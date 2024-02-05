/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import theme from "../../../services/theme/theme";
import SubmitConfirmation from "./SubmitConfirmation";
import MockProposal from "../../../services/axios/getProposal/mockProposal";


const THEME = [THEME_DARK, THEME_LIGHT];

describe('<SubmitConfirmation />', () => {
  describe('Theme', () => {
    for (const theTheme of THEME) {
      it(`Theme ${theTheme}: Renders`, () => {
        cy.mount(
          <StoreProvider>
            <ThemeProvider theme={theme(theTheme)}>
              <CssBaseline />
              <SubmitConfirmation
                open
                onClose={cy.stub().as('handleCancel')}
                onConfirm={cy.stub().as('handleConfirm')}
                proposal={MockProposal}
                setProposal={cy.stub().as('setProposal')}
                setStatus={cy.stub().as('setTheProposalState')}
              />
            </ThemeProvider>
          </StoreProvider>
        );
      });
    }
  });

  describe('Content', () => {
    beforeEach(() => {
      cy.mount(
        <StoreProvider>
          <ThemeProvider theme={theme(THEME_LIGHT)}>
            <CssBaseline />
            <SubmitConfirmation
              open
              onClose={cy.stub().as('handleCancel')}
              onConfirm={cy.stub().as('handleConfirm')}
              proposal={MockProposal}
              setProposal={cy.stub().as('setProposal')}
              setStatus={cy.stub().as('setTheProposalState')}
            />
          </ThemeProvider>
        </StoreProvider>
      );
    });
      it('renders', () => {

      });
  });
});
