import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import DownloadIcon from '@mui/icons-material/DownloadRounded';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import Icon from './Icon';

const THEME = [THEME_DARK, THEME_LIGHT];
const TOOLTIP = 'Tooltip';
const DISABLED = [true, false];

function viewPort() {
  cy.viewport(1500, 1000);
}

function mountingDefault(theTheme: any) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <Icon
        icon={<DownloadIcon />}
        onClick={cy.stub().as('setValue')}
        testId="iconIcon"
        toolTip={TOOLTIP}
      />
    </ThemeProvider>
  );
}

function mounting(theTheme: any, disabled: boolean) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <Icon
        disabled={disabled}
        icon={<DownloadIcon />}
        onClick={cy.stub().as('setValue')}
        testId="iconIcon"
        toolTip={TOOLTIP}
      />
    </ThemeProvider>
  );
}

function validateClick() {
  cy.get('[data-testid="iconIcon"]').click();
}

function validateToolTip() {
  cy.get('[data-testid="iconIcon"]').trigger('mouseover');
  cy.contains(TOOLTIP).should('be.visible');
}

describe('<Icon />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme} | Disabled DEFAULT`, () => {
      mountingDefault(theTheme);
      validateClick();
      validateToolTip();
    });
  }

  for (const theTheme of THEME) {
    for (const disabled of DISABLED) {
      it(`Theme ${theTheme} | Disabled ${disabled}`, () => {
        mounting(theTheme, disabled);
        validateClick();
        validateToolTip();
      });
    }
  }
});
