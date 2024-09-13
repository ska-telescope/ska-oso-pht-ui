import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import GridMembers from './GridMembers';
import { DEFAULT_PI } from '../../../utils/constants';
import { THEME, viewPort } from '../../../utils/testing/cypress';

function mounting(theTheme: any) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <GridMembers />
    </ThemeProvider>
  );
}

function mountingWithRow(theTheme: any) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <GridMembers rows={[DEFAULT_PI]} />
    </ThemeProvider>
  );
}

function mountingWithRowThesis(theTheme: any) {
  const DEFAULT_PI_WITH_THESIS = { ...DEFAULT_PI, phdThesis: true };

  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <GridMembers rows={[DEFAULT_PI_WITH_THESIS]} />
    </ThemeProvider>
  );
}

function mountingWithRowAction(theTheme: any) {
  viewPort();
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
