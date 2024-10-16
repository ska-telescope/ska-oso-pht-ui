import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import theme from '../../../services/theme/theme';
import ValidationResults from './ValidationResults';
import { GetMockProposal } from '../../../services/axios/getProposal/getProposal';
import { Router } from 'react-router-dom';
import { THEME, viewPort } from '../../../utils/testing/cypress';

function mounting(theTheme, proposal) {
  viewPort();
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <Router location="/" navigator={undefined}>
          <ValidationResults
            proposal={proposal}
            onClose={cy.stub().as('handleCancel')}
            results={['Error 1', 'Error 2', 'Error 3']}
            open={true}
          />
        </Router>
      </ThemeProvider>
    </StoreProvider>
  );
}

function verifyContent() {
  // cy.get('[data-testId="title"]').contains('displayProposal.warning');
}

describe('<ValidationResults />', () => {
  for (const theTheme of THEME) {

    it(`Theme ${theTheme}: Proposal : Contents`, () => {
      mounting(theTheme, GetMockProposal);
      verifyContent();
    });
  }
});

