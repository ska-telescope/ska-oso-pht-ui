import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import { GetMockProposal } from '../../../services/axios/getProposal/getProposal';
import GridObservationSummary from './GridObservationSummary';
import { THEME, viewPort } from '../../../utils/testing/cypress';

function mounting(theTheme: any, proposal) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <GridObservationSummary proposal={proposal} />
    </ThemeProvider>
  );
}

describe('<GridObservationSummary />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mounting(theTheme, GetMockProposal);
    });
  }
});
