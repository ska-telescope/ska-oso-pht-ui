import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import Velocity from './Velocity';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { THEME, viewPort } from '../../../utils/testing/cypress';

const LAB_WIDTH = 5;
const redshift = '';
const vel = '';
const velType = 0;
const velUnit = 0;

describe('<Velocity />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      viewPort();
      cy.mount(
        <StoreProvider>
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <Velocity
              labelWidth={LAB_WIDTH}
              setRedshift={cy.stub().as('setRedshift')}
              setVel={cy.stub().as('setVel')}
              setVelType={cy.stub().as('setVelType')}
              setVelUnit={cy.stub().as('setVelUnit')}
              redshift={redshift}
              vel={vel}
              velType={velType}
              velUnit={velUnit}
              velFocus={null}
              velTypeFocus={null}
              velUnitFocus={null}
            />
          </ThemeProvider>
        </StoreProvider>
      );
    });
  }
});
