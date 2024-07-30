/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import theme from '../../../services/theme/theme';
import ProposalDisplay from './ProposalDisplay';
import { GetMockProposal } from '../../../services/axios/getProposal/getProposal';
import { Router } from 'react-router-dom';

const THEME = [THEME_DARK, THEME_LIGHT];

function mounting(theTheme) {
  cy.viewport(2000, 1000);
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <Router location="/" navigator={undefined}>
          <ProposalDisplay
            onClose={cy.stub().as('handleCancel')}
            onConfirm={cy.stub().as('handleConfirm')}
            open
          />
        </Router>
      </ThemeProvider>
    </StoreProvider>
  );
}

describe('<ProposalDisplay />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mounting(theTheme);
    });
  }
});

describe('Content', () => {
  beforeEach(() => {
    cy.stub()
      .as('getProposal')
      .returns(GetMockProposal);
    mounting(THEME_LIGHT);
  });
  it('verify content', () => {
    cy.get('[aria-label="downloadBtn.label"]').should('be.visible');
    cy.get('[data-testId="cancelButtonTestId"]').click();
  });
});

// describe('PUT proposal (SUBMIT)', () => {
//   beforeEach(() => {
//     cy.mount(
//       <StoreProvider>
//         <Router location="/" navigator={undefined}>
//           <ProposalDisplay
//             pageNo={0}
//             onClose={cy.stub().as('handleCancel')}
//             onConfirm={cy.stub().as('handleConfirm')}
//             open
//           />
//         </Router>
//       </StoreProvider>
//     );
//   });
// it('displays request message in Alert component on request, Request Successful', () => {
//   cy.get('[data-testid="ConfirmButton"]').click();
//   cy.get('[data-testid="alertSaveErrorId"]')
//     .should('be.visible')
//     .should('contain', 'Success');
// });
// });
