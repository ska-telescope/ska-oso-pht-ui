/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import theme from '../../../services/theme/theme';
import ProposalDisplay from './ProposalDisplay';
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
          <ProposalDisplay
            proposal={proposal}
            onClose={cy.stub().as('handleCancel')}
            onConfirm={cy.stub().as('handleConfirm')}
            open={true}
          />
        </Router>
      </ThemeProvider>
    </StoreProvider>
  );
}

function verifyErrorPanel() {
  cy.get('[data-testId="helpPanelId"]').contains('displayProposal.warning');
}

function verifyContent() {
  // cy.get('[data-testId="title"]').contains('displayProposal.warning');
}

describe('<ProposalDisplay />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Proposal : NULL`, () => {
      mounting(theTheme, null);
      verifyErrorPanel();
    });

    it(`Theme ${theTheme}: Proposal : Contents`, () => {
      mounting(theTheme, GetMockProposal);
      verifyContent();
    });
  }
});

/*
describe('Content', () => {
  beforeEach(() => {
    cy.stub()
      .as('getProposal')
      .returns(GetMockProposal);
    mounting(THEME[1]);
  });
  it('verify content', () => {
    // cy.get('[data-testId="downloadButtonTestId"]').should('be.disabled');
    // cy.get('[data-testId="cancelButtonTestId"]').click();
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
*/
