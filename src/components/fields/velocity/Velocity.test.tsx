import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import Velocity from './Velocity';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { THEME, viewPort } from '../../../utils/testing/cypress';
import { VELOCITY_TYPE } from '../../../utils/constants';

const LAB_WIDTH = 5;
const redshift = '';
const vel = '';
const velUnit = 0;

describe('<Velocity />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: DEFAULT`, () => {
      viewPort();
      cy.mount(
        <StoreProvider>
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <Velocity vel={vel} velType={VELOCITY_TYPE.VELOCITY} velUnit={velUnit} />
          </ThemeProvider>
        </StoreProvider>
      );
    });
    it(`Theme ${theTheme}: VELOCITY`, () => {
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
              velType={VELOCITY_TYPE.VELOCITY}
              velUnit={velUnit}
              velFocus={null}
              velTypeFocus={null}
              velUnitFocus={null}
            />
          </ThemeProvider>
        </StoreProvider>
      );
    });
    it(`Theme ${theTheme}: REDSHIFT`, () => {
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
              velType={VELOCITY_TYPE.REDSHIFT}
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
