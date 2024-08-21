import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import GridMembers from './GridMembers';
import { DEFAULT_PI } from '../../../utils/constants';

const THEME = [THEME_DARK, THEME_LIGHT];

function mounting(theTheme: any) {
  cy.viewport(2000, 1000);
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <GridMembers />
    </ThemeProvider>
  );
}

function mountingWithRow(theTheme: any) {
  cy.viewport(2000, 1000);
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <GridMembers rows={[DEFAULT_PI]} />
    </ThemeProvider>
  );
}

function mountingWithRowThesis(theTheme: any) {
  const DEFAULT_PI_WITH_THESIS = { ...DEFAULT_PI, phdThesis: true };

  cy.viewport(2000, 1000);
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <GridMembers rows={[DEFAULT_PI_WITH_THESIS]} />
    </ThemeProvider>
  );
}

function mountingWithRowAction(theTheme: any) {
  cy.viewport(2000, 1000);
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <GridMembers action rows={[DEFAULT_PI]} />
    </ThemeProvider>
  );
}

describe('<GridMembers />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mounting(theTheme);
    });
  }
});

describe('<GridMembers rows=[DEFAULT_PI]/>', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mountingWithRow(theTheme);
    });
  }
});

describe('<GridMembers rows=[DEFAULT_PI_WITH_THESIS]/>', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mountingWithRowThesis(theTheme);
    });
  }
});

describe('<GridMembers  action rows=[DEFAULT_PI]/>', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mountingWithRowAction(theTheme);
    });
  }
});
