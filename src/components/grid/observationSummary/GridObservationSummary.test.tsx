import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import { GetMockProposal } from '../../../services/axios/getProposal/getProposal';
import GridObservationSummary from './GridObservationSummary';

const THEME = [THEME_DARK, THEME_LIGHT];

function mounting(theTheme: any, proposal) {
  cy.viewport(2000, 1000);
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
