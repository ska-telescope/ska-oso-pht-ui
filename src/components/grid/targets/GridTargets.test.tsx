import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import GridTargets from './GridTargets';
import { THEME, viewPort } from '../../../utils/testing/cypress';
import { DEFAULT_TARGETS } from '../../../utils/constants';

function mounting(theTheme: any) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <GridTargets raType={1} />
    </ThemeProvider>
  );
}

function mountingWithRow(theTheme: any) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <GridTargets raType={1} rows={[DEFAULT_TARGETS]} />
    </ThemeProvider>
  );
}

function mountingWithRowAction(theTheme: any) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <GridTargets
        deleteClicked={cy.stub().as('deleteClicked')}
        raType={1}
        rows={[DEFAULT_TARGETS]}
      />
    </ThemeProvider>
  );
}

describe('<GridTargets />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mounting(theTheme);
    });
  }
});

describe('<GridTargets rows=[DEFAULT_TARGETS]/>', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mountingWithRow(theTheme);
    });
  }
});

describe('<GridTargets deleteClicked rows=[DEFAULT_TARGETS]/>', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mountingWithRowAction(theTheme);
    });
  }
});
