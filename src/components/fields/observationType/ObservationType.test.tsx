import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import ObservationType from './ObservationType';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { THEME, viewPort } from '../../../utils/testing/cypress';

const value = 0;

function mountBasic(theTheme: any) {
  viewPort();
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <ObservationType setValue={cy.stub().as('setValue')} value={value} />
      </ThemeProvider>
    </StoreProvider>
  );
}

function mountSized(theTheme: any) {
  viewPort();
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <ObservationType
          isContinuumOnly
          setValue={cy.stub().as('setValue')}
          value={value}
          suffix="SUFFIX"
        />
      </ThemeProvider>
    </StoreProvider>
  );
}

function verifyObservationTypeConfiguration(inValue: number) {
  cy.get('[data-testid="observationType"]').click();
  cy.get('[data-value="' + inValue + '"]').click();
}

describe('<ObservationType />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}`, () => {
      mountBasic(theTheme);
    });
    it(`Theme ${theTheme}, suffix`, () => {
      mountSized(theTheme);
      verifyObservationTypeConfiguration(1);
    });
  }
});
